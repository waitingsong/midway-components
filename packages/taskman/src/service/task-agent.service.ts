import { randomUUID } from 'crypto'

// import { IMidwayLogger } from '@midwayjs/core'
import {
  Config,
  Init,
  Inject,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/decorator'
import {
  FetchComponent,
  JsonResp,
  Node_Headers,
} from '@mw-components/fetch'
import {
  HeadersKey,
  Logger,
  Span,
  SpanLogInput,
  TracerTag,
} from '@mw-components/jaeger'
import { KoidComponent } from '@mw-components/koid'
import { genISO8601String } from '@waiting/shared-core'
import {
  timer,
  from as ofrom,
  Observable,
  Subscription,
} from 'rxjs'
import {
  map,
  mergeMap,
  takeWhile,
} from 'rxjs/operators'


import {
  CallTaskOptions,
  ConfigKey,
  ClientURL,
  ServerURL,
  TaskDTO,
  TaskClientConfig,
  TaskServerConfig,
  TaskPayloadDTO,
  TaskState,
  initTaskClientConfig,
} from '../lib/index'

import { Context, FetchOptions } from '~/interface'


@Provide()
@Scope(ScopeEnum.Singleton)
export class TaskAgentService {

  @Inject() readonly fetch: FetchComponent

  @Inject() readonly koid: KoidComponent

  @Config(ConfigKey.clientConfig) protected readonly clientConfig: TaskClientConfig
  @Config(ConfigKey.serverConfig) protected readonly serverConfig: TaskServerConfig

  id: string
  maxRunner = 1
  runnerSet = new Set<Subscription>()

  protected intv$: Observable<number>

  @Init()
  async init(): Promise<void> {
    this.id = randomUUID()

    const pickTaskTimer = this.clientConfig.pickTaskTimer > 0
      ? this.clientConfig.pickTaskTimer
      : initTaskClientConfig.pickTaskTimer

    this.intv$ = timer(500, pickTaskTimer)
    if (this.clientConfig.maxRunner > 1) {
      this.maxRunner = this.clientConfig.maxRunner
    }
  }

  get isRunning(): boolean {
    const flag = this.runnerSet.size > 0 ? true : false
    return flag
  }

  /** 获取待执行任务记录，发送到任务执行服务供其执行 */
  async run(
    ctx?: Context,
    span?: Span,
  ): Promise<boolean> {

    if (this.clientConfig.maxRunner > 0) {
      this.maxRunner = this.clientConfig.maxRunner
    }
    if (this.runnerSet.size >= this.maxRunner) {
      return true
    }

    const logger = await ctx?.requestContext.getAsync(Logger)

    const maxPickTaskCount = this.clientConfig.maxPickTaskCount > 0
      ? this.clientConfig.maxPickTaskCount
      : initTaskClientConfig.maxPickTaskCount
    const minPickTaskCount = this.clientConfig.minPickTaskCount > 0
      ? this.clientConfig.minPickTaskCount
      : initTaskClientConfig.minPickTaskCount

    const intv$ = this.intv$.pipe(
      takeWhile((idx) => {
        if (idx < maxPickTaskCount) {
          return true
        }
        const input: SpanLogInput = {
          [TracerTag.logLevel]: 'info',
          pid: process.pid,
          message: `taskAgent stopped at ${idx} of ${maxPickTaskCount}`,
          time: genISO8601String(),
        }
        logger?.info(input, span)

        return false
      }),
    )
    const reqId = this.koid.idGenerator.toString()
    const stream$ = this.pickTasksWaitToRun(intv$, reqId).pipe(
      takeWhile(({ rows, idx }) => {
        if ((! rows || ! rows.length) && idx >= minPickTaskCount) {
          return false
        }
        return true
      }),
      mergeMap(({ rows }) => ofrom(rows)),
      mergeMap(task => this.sendTaskToRun(task, reqId), 1),
    )

    const subsp = stream$.subscribe({
      error: (err: Error) => {
        this.runnerSet.delete(subsp)

        const input: SpanLogInput = {
          [TracerTag.logLevel]: 'error',
          pid: process.pid,
          message: 'TaskAgent stopped when error',
          errMsg: err.message,
          errStack: err.stack,
          time: genISO8601String(),
        }
        logger?.warn(input)
        if (span) {
          span.finish()
        }
      },
      complete: () => {
        this.runnerSet.delete(subsp)

        const input: SpanLogInput = {
          [TracerTag.logLevel]: 'info',
          pid: process.pid,
          message: 'TaskAgent complete',
          time: genISO8601String(),
        }
        logger?.info(input)
        if (span) {
          span.finish()
        }
      },
    })

    this.runnerSet.add(subsp)
    return true
  }

  async stop(ctx?: Context, agentId?: string): Promise<void> {
    if (agentId && agentId !== this.id) {
      return
    }
    try {
      this.runnerSet.forEach((subsp) => {
        subsp.unsubscribe()
      })
    }
    catch (ex) {
      const logger = await ctx?.requestContext.getAsync(Logger)
      logger?.warn('stop with error', (ex as Error).message)
    }
    this.runnerSet.clear()
  }

  private pickTasksWaitToRun(
    intv$: Observable<number>,
    reqId: string,
  ): Observable<{ rows: TaskDTO[], idx: number }> {

    const stream$ = intv$.pipe(
      mergeMap(() => {
        const opts: FetchOptions = {
          ...this.initFetchOptions,
          method: 'GET',
          url: `${this.serverConfig.host}${ServerURL.base}/${ServerURL.pickTasksWaitToRun}`,
        }
        const headers = new Node_Headers(opts.headers)
        opts.headers = headers
        if (! opts.headers.has(HeadersKey.reqId)) {
          opts.headers.set(HeadersKey.reqId, reqId)
        }

        const res = this.fetch.fetch<TaskDTO[] | JsonResp<TaskDTO[]>>(opts)
        return res
      }, 1),
      map((res, idx) => {
        const rows = unwrapResp<TaskDTO[]>(res)
        return { rows, idx }
      }),
      // tap((rows) => {
      //   console.info(rows)
      // }),
    )
    return stream$
  }

  /**
   * 发送任务信息给任务执行接口（服务）
   */
  private async sendTaskToRun(
    task: TaskDTO | undefined,
    reqId: string,
  ): Promise<TaskDTO['taskId'] | undefined> {

    if (! task) {
      return ''
    }
    const { taskId } = task

    const opts: FetchOptions = {
      ...this.initFetchOptions,
      method: 'GET',
      url: `${this.serverConfig.host}${ServerURL.base}/${ServerURL.getPayload}`,
      data: {
        id: taskId,
      },
    }
    const headers = new Node_Headers(opts.headers)
    opts.headers = headers
    if (! opts.headers.has(HeadersKey.reqId)) {
      opts.headers.set(HeadersKey.reqId, reqId)
    }

    const info = await this.fetch.fetch<TaskPayloadDTO | undefined | JsonResp<TaskPayloadDTO | undefined>>(opts)
    const payload = unwrapResp<TaskPayloadDTO | undefined>(info)
    if (! payload) {
      return ''
    }

    await this.httpCall(taskId, reqId, payload.json)
    return taskId
  }

  private async httpCall(
    taskId: TaskDTO['taskId'],
    reqId: string,
    options?: CallTaskOptions,
  ): Promise<undefined> {

    if (! options || ! options.url) {
      // const input: SpanLogInput = {
      //   [TracerTag.logLevel]: 'error',
      //   taskId,
      //   message: 'invalid fetch options',
      //   options,
      //   time: genISO8601String(),
      // }
      // this.logger.error(input)
      return
    }

    const opts: FetchOptions = {
      ...this.initFetchOptions,
      ...options,
    }
    const headers = new Node_Headers(opts.headers)
    const key: string = this.serverConfig.headerKey ? this.serverConfig.headerKey : 'x-task-agent'
    headers.set(key, '1')
    const taskIdKey = this.serverConfig.headerKeyTaskId ? this.serverConfig.headerKeyTaskId : 'x-task-id'
    headers.set(taskIdKey, taskId)
    if (! headers.has(HeadersKey.reqId)) {
      headers.set(HeadersKey.reqId, reqId)
    }

    // // if (this.ctx.tracerManager && ! headers.has(HeadersKey.traceId)) {
    // //   const newSpan = this.ctx.tracerManager.genSpan('TaskRunner')
    // //   const spanHeader = this.ctx.tracerManager.headerOfCurrentSpan(newSpan)
    // //   if (spanHeader) {
    // //     headers.set(HeadersKey.traceId, spanHeader[HeadersKey.traceId])
    // //   }
    // // }

    // const tracerManager = await this.ctx.requestContext.getAsync(TracerManager)

    // const newSpan = tracerManager && ! headers.has(HeadersKey.traceId)
    //   ? tracerManager.genSpan('TaskRunner')
    //   : void 0
    // const spanHeader = tracerManager.headerOfCurrentSpan(newSpan)
    // if (spanHeader) {
    //   headers.set(HeadersKey.traceId, spanHeader[HeadersKey.traceId])
    // }

    opts.headers = headers

    if (opts.url.includes(`${ClientURL.base}/${ClientURL.hello}`)) {
      opts.dataType = 'text'
    }

    if (! opts.url.startsWith('http')) {
      // const input: SpanLogInput = {
      //   [TracerTag.logLevel]: 'error',
      //   taskId,
      //   message: 'invalid fetch options',
      //   opts,
      //   time: genISO8601String(),
      // }
      // this.logger.info(input)
      return
    }

    await this.fetch.fetch<void | JsonResp<void>>(opts)
      .then((res) => {
        return this.processTaskDist(taskId, reqId, res)
      })
      .catch((err) => {
        const { message } = err as Error
        if (message && message.includes('429')
          && message.includes('Task')
          && message.includes(taskId)) {
          return this.resetTaskToInitDueTo429(taskId, reqId, message)
        }
        return this.processHttpCallExp(taskId, reqId, opts, err as Error)
      })
      .finally(() => {
        // newSpan && newSpan.finish()
      })
  }

  private async processHttpCallExp(
    taskId: TaskDTO['taskId'],
    reqId: string,
    options: FetchOptions,
    err: Error,
  ): Promise<void> {

    const msg = {
      reqId,
      taskId,
      options,
      errMessage: err.message,
    }
    const opts: FetchOptions = {
      ...this.initFetchOptions,
      method: 'POST',
      url: `${this.serverConfig.host}${ServerURL.base}/${ServerURL.setState}`,
      data: {
        id: taskId,
        state: TaskState.failed,
        msg: JSON.stringify(msg),
      },
    }
    const headers = new Node_Headers(opts.headers)
    opts.headers = headers
    if (! headers.has(HeadersKey.reqId)) {
      headers.set(HeadersKey.reqId, reqId)
    }

    await this.fetch.fetch(opts)
      .catch((ex) => {
        // this.logger.error(ex)
        console.error(ex)
      })

    // this.logger.error(err)
    console.error(err)
  }

  get initFetchOptions(): FetchOptions {
    const opts: FetchOptions = {
      url: '',
      method: 'GET',
      contentType: 'application/json; charset=utf-8',
    }
    return opts
  }


  private async processTaskDist(
    taskId: TaskDTO['taskId'],
    reqId: string,
    input: void | JsonResp<void>,
  ): Promise<void> {

    if (input && input.code === 429) {
      await this.resetTaskToInitDueTo429(taskId, reqId, '')
    }
  }

  private async resetTaskToInitDueTo429(
    taskId: TaskDTO['taskId'],
    reqId: string,
    message: string,
  ): Promise<void> {

    const msg = {
      reqId,
      taskId,
      errMessage: `reset taskState to "${TaskState.init}" due to httpCode=429`,
    }
    if (message) {
      msg.errMessage += `\n${message}`
    }

    const opts: FetchOptions = {
      ...this.initFetchOptions,
      method: 'POST',
      url: `${this.serverConfig.host}${ServerURL.base}/${ServerURL.setState}`,
      data: {
        id: taskId,
        state: TaskState.init,
        msg: JSON.stringify(msg),
      },
    }
    const headers = new Node_Headers(opts.headers)
    opts.headers = headers
    if (! headers.has(HeadersKey.reqId)) {
      headers.set(HeadersKey.reqId, reqId)
    }

    await this.fetch.fetch(opts)
      .catch((ex) => {
        // this.logger.error({ opts, ex: ex as Error })
        console.error({ opts, ex: ex as Error })
      })

  }

}


function unwrapResp<T>(input: T | JsonResp<T>): T {
  if (typeof input === 'undefined') {
    return input
  }
  if (typeof (input as JsonResp<T>).code === 'number') {
    const ret = (input as JsonResp<T>).data as T
    return ret
  }
  return input as T
}

