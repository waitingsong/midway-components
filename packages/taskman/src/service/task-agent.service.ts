import {
  Config,
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

import { CallTaskOptions, ServerAgent, TaskDTO, TaskManServerConfig, TaskState } from '../lib/index'

import { TaskQueueService } from './task-queue.service'


let globalAgentRunning = 0


@Provide()
export class TaskAgentService {

  @Inject('jaeger:logger') protected readonly logger: Logger

  @Inject() readonly fetch: FetchComponent

  @Inject() protected readonly queueSvc: TaskQueueService

  @Config('taskManServerConfig') protected readonly config: TaskManServerConfig

  protected readonly intv$ = timer(1000, 15000)
  protected subscription: Subscription | undefined

  get isRunning(): boolean {
    const flag = this.subscription && ! this.subscription.closed
      ? true
      : false
    return flag
  }

  async run(): Promise<void> {
    if (globalAgentRunning >= 1) {
      return
    }
    const intv$ = this.intv$.pipe(
      tap((idx) => {
        if (idx > 5000) {
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

  private async sendTaskToRun(task: TaskDTO | undefined): Promise<TaskDTO['taskId']> {
    if (! task) {
      return ''
    }
    const { taskId } = task
    const payload = await this.queueSvc.getPayload(taskId)
    if (! payload) {
      return ''
    }

    await this.queueSvc.setRunning(taskId)

    const res = this.httpCall(taskId, payload.json)
      .then(() => task.taskId)
      .catch(async (ex) => {
        await this.queueSvc.setState(taskId, TaskState.init)
          .catch((ex2) => {
            this.logger.warn(ex2)
          })
        this.logger.warn(ex)
        return ''
      })
    return res
  }

  private async httpCall(
    taskId: TaskDTO['taskId'],
    options: CallTaskOptions,
  ): Promise<unknown> {

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

    const ret = await this.fetch.fetch(opts)
      .then((res) => {
        // console.info(res)
        return res
      })
    return ret
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

