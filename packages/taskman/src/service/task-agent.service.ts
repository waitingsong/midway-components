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
import { Logger } from '@mw-components/jaeger'
import {
  timer,
  from as ofrom,
  Observable,
  Subscription,
} from 'rxjs'
import {
  map,
  mergeMap,
  tap,
} from 'rxjs/operators'

import {
  CallTaskOptions,
  ServerAgent,
  TaskDTO,
  TaskManClientConfig,
  TaskManServerConfig,
  TaskState,
  agentConcurrentConfig,
  initTaskManClientConfig,
  TaskPayloadDTO,
} from '../lib/index'

// import { TaskQueueService } from './task-queue.service'

import { Context, FetchOptions } from '~/interface'


@Provide()
export class TaskAgentService {

  @Inject() protected readonly ctx: Context

  @Inject('jaeger:logger') protected readonly logger: Logger

  @Inject('fetch:fetchComponent') readonly fetch: FetchComponent

  // @Inject() protected readonly queueSvc: TaskQueueService

  @Config('taskManServerConfig') protected readonly config: TaskManServerConfig
  @Config('taskManClientConfig') protected readonly clientConfig: TaskManClientConfig

  protected intv$: Observable<number>
  protected subscription: Subscription | undefined

  @Init()
  async init(): Promise<void> {

    const pickTaskTimer = this.clientConfig.pickTaskTimer > 0
      ? this.clientConfig.pickTaskTimer
      : initTaskManClientConfig.pickTaskTimer

    this.intv$ = timer(500, pickTaskTimer)
  }

  get isRunning(): boolean {
    const flag = this.subscription && ! this.subscription.closed
      ? true
      : false
    return flag
  }

  /** 获取待执行任务记录，发送到任务执行服务供其执行 */
  async run(): Promise<boolean> {
    if (agentConcurrentConfig.count >= agentConcurrentConfig.max) {
      return false
    }
    const maxPickTaskCount = this.clientConfig.maxPickTaskCount > 0
      ? this.clientConfig.maxPickTaskCount
      : initTaskManClientConfig.maxPickTaskCount

    const intv$ = this.intv$.pipe(
      tap((idx) => {
        if (idx > maxPickTaskCount) {
          this.stop()
          const input = {
            message: `taskAgent stopped at ${idx} of ${maxPickTaskCount}`,
          }
          this.logger.log(input)
        }
      }),
    )
    const stream$ = this.pickTasksWaitToRun(intv$).pipe(
      mergeMap(rows => ofrom(rows)),
      mergeMap(task => this.sendTaskToRun(task), 1),
    )
    this.subscription = stream$.subscribe()
    agentConcurrentConfig.count += 1
    return true
  }

  stop(): void {
    this.subscription && this.subscription.unsubscribe()
    // this.queueSvc.destroy()
    agentConcurrentConfig.count = 0
  }

  private pickTasksWaitToRun(intv$: Observable<number>): Observable<TaskDTO[]> {
    const stream$ = intv$.pipe(
      // concatMap(() => this.queueSvc.pickTasksWaitToRun({ maxRows: 1 })),
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
      }, 2),
      map((res) => {
        if (Array.isArray(res)) {
          return res
        }
        return res.data
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

    // const payload = await this.queueSvc.getPayload(taskId)
    const payload = await this.fetch.fetch<TaskPayloadDTO | undefined>(opts)
    if (! payload) {
      return ''
    }

    const res = this.httpCall(taskId, payload.json)
    return res
  }

  private async httpCall(
    taskId: TaskDTO['taskId'],
    options: CallTaskOptions,
  ): Promise<TaskDTO['taskId'] | undefined> {

    const opts: FetchOptions = {
      ...this.initFetchOptions,
      ...options,
    }
    const headers = new Node_Headers(opts.headers)
    const key: string = this.config.headerKey ? this.config.headerKey : 'x-task-agent'
    headers.set(key, '1')
    const taskIdKey = this.config.headerKeyTaskId ? this.config.headerKeyTaskId : 'x-task-id'
    headers.set(taskIdKey, taskId)
    opts.headers = headers

    if (opts.url.includes(`${ServerAgent.base}/${ServerAgent.hello}`)) {
      opts.dataType = 'text'
    }

    const ret = await this.fetch.fetch<TaskDTO['taskId']>(opts)
      .catch((err) => {
        return this.processHttpCallExp(taskId, opts, err as Error)
      })
      .then((res) => {
        // console.info(res)
        return res ? taskId : void 0
      })
    return ret
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
    // await this.queueSvc.setState(taskId, TaskState.failed, JSON.stringify(msg))
    //   .catch((ex) => {
    //     this.logger.error(ex)
    //   })
    const opts: FetchOptions = {
      ...this.initFetchOptions,
      method: 'POST',
      url: `${this.clientConfig.host}${ServerAgent.base}/${ServerAgent.setState}`,
      data: {
        id: taskId,
        state: TaskState.failed,
        msg,
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
}

