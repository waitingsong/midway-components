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
  HeadersKey,
  OtelComponent,
  Span,
  SpanKind,
  TraceContext,
  TraceInit,
} from '@mwcp/otel'
import { sleep } from '@waiting/shared-core'
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
} from '##/lib/index.js'


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
  protected rootSpan: Span | undefined
  protected rootTraceCtx: TraceContext | undefined

  @TraceInit()
  @Init()
  async init(): Promise<void> {
    this.id = randomUUID()

    const pickTaskTimer = this.clientConfig.pickTaskTimer > 0
      ? this.clientConfig.pickTaskTimer
      : initTaskClientConfig.pickTaskTimer

    this.intv$ = timer(10, pickTaskTimer)
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

  /** 启动轮询：获取待执行任务记录，发送到任务执行服务供其执行 */
  start(): void {
    if (this.isRunning) { return }

    const { intv$ } = this
    const stream$ = this.pickTasksWaitToRun(intv$).pipe(
      mergeMap(({ rows, headers }) => {
        const foo$ = ofrom(rows).pipe(
          map(row => ({
            task: row,
            headers,
          })),
        )
        return foo$
      }),
      mergeMap(({ task, headers }) => this.sendTaskToRun(task, headers), 2),
    )

    this.sub = stream$.subscribe({
      complete: () => { void 0 },
    })
  }

  stop(): void {
    try {
      this.sub?.unsubscribe()
    }
    /* c8 ignore next 4 */
    catch (ex) {
      this.logger.warn('stop with error', (ex as Error).message)
    }
    // if (this.rootSpan) {
    //   const input: Attributes = {
    //     [AttrNames.LogLevel]: 'info',
    //     message: 'TaskAgent complete',
    //     time: genISO8601String(),
    //   }
    //   this.otel.addEvent(this.rootSpan, input)
    //   this.otel.endRootSpan(this.rootSpan)
    // }
    // this.rootSpan = void 0
    // this.rootTraceCtx = void 0
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
  ): Observable<{ rows: TaskDTO[], headers: Headers }> {

    const { supportTaskMap } = this.clientConfig
    const taskTypeId = this.pickRandomTaskTypeIdFromSupportTaskMap(supportTaskMap)
    if (! taskTypeId) {
      return of({ rows: [], idx: 0, headers: new Headers() })
    }
    const taskTypeVerList = supportTaskMap.get(taskTypeId) ?? []

    const data: PickInitTaskOptions = {
      ...initPickInitTasksOptions,
      taskTypeId,
      taskTypeVerList,
    }

    const stream$ = intv$.pipe(
      mergeMap(async () => {
        const spanName = `${ConfigKey.namespace} pickTasksWaitToRun`
        const { span, context } = this.otel.startSpan2(spanName, {
          root: true,
          kind: SpanKind.CONSUMER,
        }, this.rootTraceCtx)

        const opts: FetchOptions = {
          ...this.initFetchOptions,
          method: 'POST',
          url: `${this.serverConfig.host}${ServerURL.base}/${ServerURL.pickTasksWaitToRun}`,
          data,
          span,
          traceContext: context,
        }
        opts.headers = new Headers(opts.headers)
        let reqId = ''
        const reqId2 = opts.headers.get(HeadersKey.reqId)
        if (reqId2) {
          reqId = reqId2
        }
        else {
          reqId = this.koid.idGenerator.toString()
          opts.headers.set(HeadersKey.reqId, reqId)
        }

        try {
          const [res, headers] = await this.fetch.fetch2<TaskDTO[] | JsonResp<TaskDTO[]>>(opts)
          this.otel.endRootSpan(span)
          const rows = unwrapResp<TaskDTO[]>(res)
          return { rows, headers }
        }
        catch (ex) {
          this.otel.setSpanWithError(void 0, span, ex as Error)
          this.otel.endRootSpan(span)
          await sleep(1000)
          return { rows: [], headers: new Headers() }
        }
      }, 1),
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
    headers: Headers,
  ): Promise<TaskDTO['taskId'] | undefined> {

    if (! task) {
      return ''
    }
    const { taskId } = task

    const spanName = `${ConfigKey.namespace} sendTaskToRun`
    const { span, context } = this.otel.startSpan2(spanName, { kind: SpanKind.CONSUMER }, this.rootTraceCtx)

    const reqId = headers.get(HeadersKey.reqId) ?? this.koid.idGenerator.toString()
    const traceId = headers.get(HeadersKey.traceId) ?? ''

    const opts: FetchOptions = {
      ...this.initFetchOptions,
      method: 'GET',
      url: `${this.serverConfig.host}${ServerURL.base}/${ServerURL.getPayload}`,
      data: {
        id: taskId,
      },
      span,
      traceContext: context,
    }
    const headers2 = new Headers(opts.headers)
    headers2.set(HeadersKey.reqId, reqId)
    headers2.set(HeadersKey.traceId, traceId)
    opts.headers = headers2

    const [info] = await this.fetch.fetch2<TaskPayloadDTO | JsonResp<TaskPayloadDTO | undefined>>(opts)
    this.otel.endRootSpan(span)
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

    const spanName = `${ConfigKey.namespace} httpCall`
    const { span, context } = this.otel.startSpan2(spanName, {
      root: true,
      kind: SpanKind.CONSUMER,
    }, this.rootTraceCtx)

    const opts = {
      ...this.initFetchOptions,
      ...options,
      span,
      traceContext: context,
    } as FetchOptions

    const headers = new Headers(opts.headers)
    const key: string = this.serverConfig.headerKey ? this.serverConfig.headerKey : 'x-task-agent'
    headers.set(key, '1')
    const taskIdKey = this.serverConfig.headerKeyTaskId ? this.serverConfig.headerKeyTaskId : 'x-task-id'
    headers.set(taskIdKey, taskId)
    if (! headers.has(HeadersKey.reqId)) {
      headers.set(HeadersKey.reqId, reqId)
    }

    opts.headers = headers

    const url = pickUrlStrFromRequestInfo(opts.url)
    if (url.includes(`${ClientURL.base}/${ClientURL.hello}`)) {
      opts.dataType = 'text'
    }

    if (! url.startsWith('http')) { return }

    await this.fetch.fetch<void | JsonResp<void>>(opts)
      .catch(() => {
        return this.fetch.fetch<void | JsonResp<void>>(opts)
      })
      .then((res) => {
        return this.processTaskDist(taskId, reqId, res)
      })
      .catch((ex) => {
        const err = ex instanceof Error
          ? ex
          : new Error(JSON.stringify(ex))

        try {
          const opts2 = {
            url: opts.url,
            method: opts.method,
            headers: opts.headers,
            data: opts.data,
          }
          const attrs: Attributes = {
            event: 'fetch.error',
            url,
            callTaskOptions: JSON.stringify(opts2),
            message: err.message,
            cause: typeof err.cause === 'string' ? err.cause : '',
          }
          this.otel.addEvent(span, attrs)
          this.otel.setSpanWithError(void 0, span, err)
        }
        catch (ex2) {
          void ex2
        }

        setTimeout(() => {
          this.start()
        }, 1000)

        const { message } = err
        if (message?.includes('429')
            && message?.includes('Task')
            && message?.includes(taskId)) {
          return this.resetTaskToInitDueTo429(taskId, reqId, message)
        }
        return this.processHttpCallExp(taskId, reqId, opts, err as Error)
      })
      .finally(() => {
        this.otel.endRootSpan(span)
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
      options: {
        url: options.url,
        method: options.method,
        headers: options.headers,
        contentType: options.contentType,
        data: options.data,
        dataType: options.dataType,
      },
      errMessage: err.message,
      errCause: typeof err.cause === 'string' ? err.cause : '',
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
      dataType: 'json',
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

