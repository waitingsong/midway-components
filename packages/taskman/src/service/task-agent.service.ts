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

import { CallTaskOptions, TaskDTO, TaskManServerConfig, TaskState } from '../lib/index'

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
    )
    return stream$
  }

  private async sendTaskToRun(task: TaskDTO | undefined): Promise<unknown> {
    if (! task) {
      return
    }
    const { taskId } = task
    const payload = await this.queueSvc.getPayload(taskId)
    if (! payload) {
      return
    }

    const res = this.httpCall(payload.json)
      .catch(async (ex) => {
        await this.queueSvc.setState(taskId, TaskState.init)
          .catch(ex2 => this.logger.error(ex2))
        this.logger.error(ex)
      })
    return res
  }

  private async httpCall(options: CallTaskOptions): Promise<unknown> {
    const opts: FetchOptions = {
      ...options,
    }
    const headers = new Node_Headers(opts.headers)
    const key = this.config.headerKey ? this.config.headerKey : 'x-task-agent'
    headers.set(key, '1')
    opts.headers = headers
    const ret = this.fetch.fetch(opts)
    // .then((res) => {
    //   console.info(res)
    //   return res
    // })
    return ret
  }
}

