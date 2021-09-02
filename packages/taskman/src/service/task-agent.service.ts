import { randomUUID } from 'crypto'

import {
  Config,
  Init,
  Inject,
  Provide,
} from '@midwayjs/decorator'
import {
  FetchComponent,
  JsonResp,
  Node_Headers,
} from '@mw-components/fetch'
import { HeadersKey, Logger, Span, SpanLogInput, TracerTag } from '@mw-components/jaeger'
import { genISO8601String } from '@waiting/shared-core'
import {
  timer,
  from as ofrom,
  Observable,
} from 'rxjs'
import {
  map,
  mergeMap,
  takeWhile,
} from 'rxjs/operators'

import { taskAgentSubscriptionMap } from '../lib/data'
import {
  CallTaskOptions,
  ServerAgent,
  TaskDTO,
  TaskManClientConfig,
  TaskManServerConfig,
  TaskPayloadDTO,
  TaskState,
  initTaskAgentConfig,
  initTaskManClientConfig,
} from '../lib/index'

import { Context, FetchOptions } from '~/interface'


@Provide()
export class TaskAgentService {

  @Inject() protected readonly ctx: Context

  @Inject('jaeger:logger') protected readonly logger: Logger

  @Inject('fetch:fetchComponent') readonly fetch: FetchComponent

  @Config('taskManServerConfig') protected readonly config: TaskManServerConfig
  @Config('taskManClientConfig') protected readonly clientConfig: TaskManClientConfig

  id: string

  protected intv$: Observable<number>

  @Init()
  async init(): Promise<void> {
    this.id = randomUUID()

    const pickTaskTimer = this.clientConfig.pickTaskTimer > 0
      ? this.clientConfig.pickTaskTimer
      : initTaskManClientConfig.pickTaskTimer

    this.intv$ = timer(500, pickTaskTimer)
  }

  get isRunning(): boolean {
    const flag = taskAgentSubscriptionMap.size > 0 ? true : false
    return flag
  }

  /** 获取待执行任务记录，发送到任务执行服务供其执行 */
  async run(span?: Span): Promise<boolean> {
    if (taskAgentSubscriptionMap.size >= initTaskAgentConfig.maxRunning) {
      return false
    }
    const maxPickTaskCount = this.clientConfig.maxPickTaskCount > 0
      ? this.clientConfig.maxPickTaskCount
      : initTaskManClientConfig.maxPickTaskCount
    const minPickTaskCount = this.clientConfig.minPickTaskCount > 0
      ? this.clientConfig.minPickTaskCount
      : initTaskManClientConfig.minPickTaskCount

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
        this.logger.log(input, span)
        return false
      }),
    )
    const stream$ = this.pickTasksWaitToRun(intv$).pipe(
      takeWhile(({ rows, idx }) => {
        if ((! rows || ! rows.length) && idx >= minPickTaskCount) {
          return false
        }
        return true
      }),
      mergeMap(({ rows }) => ofrom(rows)),
      mergeMap(task => this.sendTaskToRun(task), 1),
    )

    const subsp = stream$.subscribe({
      error: (err: Error) => {
        taskAgentSubscriptionMap.delete(this.id)

        const input: SpanLogInput = {
          [TracerTag.logLevel]: 'error',
          pid: process.pid,
          message: 'TaskAgent stopped when error',
          errMsg: err.message,
          time: genISO8601String(),
        }
        this.logger.warn(input)
      },
      complete: () => {
        taskAgentSubscriptionMap.delete(this.id)

        const input: SpanLogInput = {
          [TracerTag.logLevel]: 'info',
          pid: process.pid,
          message: 'TaskAgent complete',
          time: genISO8601String(),
        }
        this.logger.info(input)
      },
    })

    taskAgentSubscriptionMap.set(this.id, subsp)
    return true
  }

  stop(): void {
    const subsp = taskAgentSubscriptionMap.get(this.id)
    if (subsp) {
      subsp.unsubscribe()
      taskAgentSubscriptionMap.delete(this.id)
    }
  }

  private pickTasksWaitToRun(intv$: Observable<number>): Observable<{ rows: TaskDTO[], idx: number }> {
    const stream$ = intv$.pipe(
      mergeMap(() => {
        const opts: FetchOptions = {
          ...this.initFetchOptions,
          method: 'GET',
          url: `${this.clientConfig.host}${ServerAgent.base}/${ServerAgent.pickTasksWaitToRun}`,
        }
        const headers = new Node_Headers(opts.headers)
        opts.headers = headers

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
  private async sendTaskToRun(task: TaskDTO | undefined): Promise<TaskDTO['taskId'] | undefined> {
    if (! task) {
      return ''
    }
    const { taskId } = task

    const opts: FetchOptions = {
      ...this.initFetchOptions,
      method: 'GET',
      url: `${this.clientConfig.host}${ServerAgent.base}/${ServerAgent.getPayload}`,
      data: {
        id: taskId,
      },
    }
    const headers = new Node_Headers(opts.headers)
    opts.headers = headers

    const info = await this.fetch.fetch<TaskPayloadDTO | undefined | JsonResp<TaskPayloadDTO | undefined>>(opts)
    const payload = unwrapResp<TaskPayloadDTO | undefined>(info)
    if (! payload) {
      return ''
    }

    await this.httpCall(taskId, payload.json)
    return taskId
  }

  private async httpCall(
    taskId: TaskDTO['taskId'],
    options?: CallTaskOptions,
  ): Promise<undefined> {

    if (! options || ! options.url) {
      const input: SpanLogInput = {
        [TracerTag.logLevel]: 'error',
        taskId,
        message: 'invalid fetch options',
        options,
        time: genISO8601String(),
      }
      this.logger.error(input)
      return
    }

    const opts: FetchOptions = {
      ...this.initFetchOptions,
      ...options,
    }
    const headers = new Node_Headers(opts.headers)
    const key: string = this.config.headerKey ? this.config.headerKey : 'x-task-agent'
    headers.set(key, '1')
    const taskIdKey = this.config.headerKeyTaskId ? this.config.headerKeyTaskId : 'x-task-id'
    headers.set(taskIdKey, taskId)

    if (this.ctx.tracerManager && ! headers.has(HeadersKey.traceId)) {
      const newSpan = this.ctx.tracerManager.genSpan('TaskRunner')
      const spanHeader = this.ctx.tracerManager.headerOfCurrentSpan(newSpan)
      if (spanHeader) {
        headers.set(HeadersKey.traceId, spanHeader[HeadersKey.traceId])
      }
    }

    opts.headers = headers


    if (opts.url.includes(`${ServerAgent.base}/${ServerAgent.hello}`)) {
      opts.dataType = 'text'
    }

    if (! opts.url.startsWith('http')) {
      const input: SpanLogInput = {
        [TracerTag.logLevel]: 'error',
        taskId,
        message: 'invalid fetch options',
        opts,
        time: genISO8601String(),
      }
      this.logger.error(input)
      return
    }

    await this.fetch.fetch<void | JsonResp<void>>(opts)
      .then((res) => {
        return this.processTaskDist(taskId, res)
      })
      .catch((err) => {
        const { message } = err as Error
        if (message && message.includes('429')
          && message.includes('Task')
          && message.includes(taskId)) {
          return this.resetTaskToInitDueTo429(taskId, message)
        }
        return this.processHttpCallExp(taskId, opts, err as Error)
      })
  }

  private async processHttpCallExp(
    taskId: TaskDTO['taskId'],
    options: FetchOptions,
    err: Error,
  ): Promise<void> {

    const rid = this.ctx.reqId as string

    const msg = {
      reqId: rid,
      taskId,
      options,
      errMessage: err.message,
    }
    const opts: FetchOptions = {
      ...this.initFetchOptions,
      method: 'POST',
      url: `${this.clientConfig.host}${ServerAgent.base}/${ServerAgent.setState}`,
      data: {
        id: taskId,
        state: TaskState.failed,
        msg: JSON.stringify(msg),
      },
    }
    const headers = new Node_Headers(opts.headers)
    opts.headers = headers

    await this.fetch.fetch(opts)
      .catch((ex) => {
        this.logger.error(ex)
      })

    this.logger.error(err)
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
    input: void | JsonResp<void>,
  ): Promise<void> {

    if (input && input.code === 429) {
      await this.resetTaskToInitDueTo429(taskId)
    }
  }

  private async resetTaskToInitDueTo429(
    taskId: TaskDTO['taskId'],
    message?: string,
  ): Promise<void> {

    const rid = this.ctx.reqId as string
    const msg = {
      reqId: rid,
      taskId,
      errMessage: `reset taskState to "${TaskState.init}" due to httpCode=429`,
    }
    if (message) {
      msg.errMessage += `\n${message}`
    }

    const opts: FetchOptions = {
      ...this.initFetchOptions,
      method: 'POST',
      url: `${this.clientConfig.host}${ServerAgent.base}/${ServerAgent.setState}`,
      data: {
        id: taskId,
        state: TaskState.init,
        msg: JSON.stringify(msg),
      },
    }
    const headers = new Node_Headers(opts.headers)
    opts.headers = headers

    await this.fetch.fetch(opts)
      .catch((ex) => {
        this.logger.error({ opts, ex: ex as Error })
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

