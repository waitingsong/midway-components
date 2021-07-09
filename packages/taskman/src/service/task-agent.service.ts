import {
  Config,
  Init,
  Inject,
  Provide,
} from '@midwayjs/decorator'
import { FetchComponent, Node_Headers, Options as FetchOptions } from '@mw-components/fetch'
import { Logger } from '@mw-components/jaeger'
import {
  timer,
  from as ofrom,
  Observable,
  Subscription,
} from 'rxjs'
import {
  concatMap,
  mergeMap,
  tap,
} from 'rxjs/operators'

import { CallTaskOptions, initTaskManClientConfig, ServerAgent, TaskDTO, TaskManClientConfig, TaskManServerConfig, TaskState } from '../lib/index'

import { TaskQueueService } from './task-queue.service'


let globalAgentRunning = 0


@Provide()
export class TaskAgentService {

  @Inject('jaeger:logger') protected readonly logger: Logger

  @Inject('fetch:fetchComponent') readonly fetch: FetchComponent

  @Inject() protected readonly queueSvc: TaskQueueService

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
  async run(): Promise<void> {
    if (globalAgentRunning >= 1) {
      return
    }
    const maxPickTaskCount = this.clientConfig.maxPickTaskCount > 0
      ? this.clientConfig.maxPickTaskCount
      : initTaskManClientConfig.maxPickTaskCount

    const intv$ = this.intv$.pipe(
      tap((idx) => {
        if (idx > maxPickTaskCount) {
          this.stop()
        }
      }),
    )
    const stream$ = this.pickTasksWaitToRun(intv$).pipe(
      mergeMap(rows => ofrom(rows)),
      mergeMap(task => this.sendTaskToRun(task), 1),
    )
    this.subscription = stream$.subscribe()
    globalAgentRunning += 1
  }

  stop(): void {
    this.subscription && this.subscription.unsubscribe()
    this.queueSvc.destroy()
    globalAgentRunning = 0
  }

  private pickTasksWaitToRun(intv$: Observable<number>): Observable<TaskDTO[]> {
    const stream$ = intv$.pipe(
      concatMap(() => this.queueSvc.pickTasksWaitToRun({ maxRows: 1 })),
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
    const payload = await this.queueSvc.getPayload(taskId)
    if (! payload) {
      return ''
    }

    // await this.queueSvc.setRunning(taskId)

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

    const msg = {
      taskId,
      options,
      errMessage: err.message,
    }
    await this.queueSvc.setState(taskId, TaskState.failed, JSON.stringify(msg))
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

