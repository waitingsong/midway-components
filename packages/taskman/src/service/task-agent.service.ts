/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import assert from 'node:assert'
import { randomUUID } from 'node:crypto'

import {
  Config,
  Init,
  Inject,
  Singleton,
} from '@midwayjs/core'
import { ILogger } from '@midwayjs/logger'
import { FetchOptions } from '@mwcp/boot'
import {
  FetchComponent,
  JsonResp,
  Headers,
  pickUrlStrFromRequestInfo,
} from '@mwcp/fetch'
import { KoidComponent } from '@mwcp/koid'
import {
  Attributes,
  AttrNames,
  HeadersKey,
  OtelComponent,
  Span,
  SpanStatusCode,
  TraceContext,
} from '@mwcp/otel'
import { genISO8601String } from '@waiting/shared-core'
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  of,
  timer,
  from as ofrom,
  Observable,
  Subscription,
  map,
  mergeMap,
} from 'rxjs'

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
  TaskAgentState,
  initPickInitTasksOptions,
  PickInitTaskOptions,
} from '../lib/index'


@Singleton()
export class TaskAgentService {

  @Inject() readonly fetch: FetchComponent
  @Inject() readonly otel: OtelComponent
  @Inject() readonly koid: KoidComponent
  @Inject() readonly logger: ILogger

  @Config(ConfigKey.clientConfig) protected readonly clientConfig: TaskClientConfig
  @Config(ConfigKey.serverConfig) protected readonly serverConfig: TaskServerConfig

  id: string

  protected intv$: Observable<number>
  protected sub: Subscription | undefined
  protected span: Span | undefined
  protected traceCtx: TraceContext | undefined

  @Init()
  async init(): Promise<void> {
    this.id = randomUUID()

    const pickTaskTimer = this.clientConfig.pickTaskTimer > 0
      ? this.clientConfig.pickTaskTimer
      : initTaskClientConfig.pickTaskTimer

    this.intv$ = timer(500, pickTaskTimer)
    this.start()
  }

  get isRunning(): boolean {
    const flag = this.sub
      ? ! this.sub.closed
      : false
    return flag
  }

  status(): TaskAgentState {
    const taskAgentState: TaskAgentState = {
      agentId: this.id,
      isRunning: this.isRunning,
    }
    return taskAgentState
  }

  /** 获取待执行任务记录，发送到任务执行服务供其执行 */
  start(): void {
    if (this.isRunning) { return }
    if (this.clientConfig.enableTrace) {
      const spanName = 'TaskAgent-start'
      const { span, context } = this.otel.startSpan2(spanName, { root: true })
      this.span = span
      this.traceCtx = context
    }

    const { intv$ } = this
    const reqId = this.koid.idGenerator.toString()
    const stream$ = this.pickTasksWaitToRun(intv$, reqId).pipe(
      mergeMap(({ rows }) => ofrom(rows)),
      mergeMap(task => this.sendTaskToRun(task, reqId), 1),
    )

    this.sub = stream$.subscribe({
      error: (err: Error) => {
        if (this.span) {
          const input: Attributes = {
            [AttrNames.LogLevel]: 'error',
            pid: process.pid,
            message: 'TaskAgent stopped when error',
            errMsg: err.message,
            errStack: err.stack,
            time: genISO8601String(),
          }
          this.otel.addEvent(this.span, input)
          this.otel.endSpan(this.span, this.span, {
            code: SpanStatusCode.ERROR,
            error: err,
          })
        }
      },
      complete: () => {
        if (this.span) {
          const input: Attributes = {
            [AttrNames.LogLevel]: 'info',
            message: 'TaskAgent complete',
            time: genISO8601String(),
          }
          this.otel.addEvent(this.span, input)
          this.otel.endSpan(this.span, this.span)
        }
      },
    })
  }

  async stop(agentId?: string): Promise<void> {
    if (agentId && agentId !== this.id) { return }
    try {
      this.sub?.unsubscribe()
    }
    /* c8 ignore next 4 */
    catch (ex) {
      this.logger.warn('stop with error', (ex as Error).message)
    }
  }

  protected pickRandomTaskTypeIdFromSupportTaskMap(
    supportTaskMap: TaskClientConfig['supportTaskMap'],
  ): TaskDTO['taskTypeId'] | undefined {

    const { size } = supportTaskMap
    if (size === 0) {
      console.info(false, 'taskClientConfig.supportTaskMap is empty')
      return
    }

    const min = 0
    const max = size - 1
    const rnd = Math.floor((Math.random() * (max - min + 1)) + min)

    const idx = 0
    for (const [taskTypeId] of supportTaskMap) {
      if (rnd === idx) {
        return taskTypeId
      }
    }

    assert(false, `pickRandomTaskTypeIdFromSupportTaskMap failed, rnd: ${rnd}, size: ${size}`)
  }

  private pickTasksWaitToRun(
    intv$: Observable<number>,
    reqId: string,
  ): Observable<{ rows: TaskDTO[], idx: number }> {

    const { supportTaskMap } = this.clientConfig
    const taskTypeId = this.pickRandomTaskTypeIdFromSupportTaskMap(supportTaskMap)
    if (! taskTypeId) {
      return of({ rows: [], idx: 0 })
    }
    const taskTypeVerList = supportTaskMap.get(taskTypeId) ?? []

    const data: PickInitTaskOptions = {
      ...initPickInitTasksOptions,
      taskTypeId,
      taskTypeVerList,
    }

    const stream$ = intv$.pipe(
      mergeMap(() => {
        const opts: FetchOptions = {
          ...this.initFetchOptions,
          method: 'POST',
          url: `${this.serverConfig.host}${ServerURL.base}/${ServerURL.pickTasksWaitToRun}`,
          data,
        }
        const headers = new Headers(opts.headers)
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
    const headers = new Headers(opts.headers)
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

    if (! options?.url) { return }

    const opts = {
      ...this.initFetchOptions,
      ...options,
    } as FetchOptions
    const headers = new Headers(opts.headers)
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

    const url = pickUrlStrFromRequestInfo(opts.url)
    if (url.includes(`${ClientURL.base}/${ClientURL.hello}`)) {
      opts.dataType = 'text'
    }

    if (! url.startsWith('http')) { return }

    await this.fetch.fetch<void | JsonResp<void>>(opts)
      .then((res) => {
        return this.processTaskDist(taskId, reqId, res)
      })
      .catch((err) => {
        if (err instanceof Error) {
          const { message } = err as Error
          if (message?.includes('429')
            && message?.includes('Task')
            && message?.includes(taskId)) {
            return this.resetTaskToInitDueTo429(taskId, reqId, message)
          }
          return this.processHttpCallExp(taskId, reqId, opts, err as Error)
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        throw new Error(err)
      })
      // .finally(() => {
      //   // newSpan && newSpan.finish()
      // })
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
    const headers = new Headers(opts.headers)
    opts.headers = headers
    if (! headers.has(HeadersKey.reqId)) {
      headers.set(HeadersKey.reqId, reqId)
    }

    await this.fetch.fetch(opts)
      /* c8 ignore next 4 */
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
      headers: new Headers(),
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
    const headers = new Headers(opts.headers)
    opts.headers = headers
    if (! headers.has(HeadersKey.reqId)) {
      headers.set(HeadersKey.reqId, reqId)
    }

    await this.fetch.fetch(opts)
      /* c8 ignore next 4 */
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

