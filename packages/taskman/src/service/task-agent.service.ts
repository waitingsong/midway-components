import {
  Inject,
  Provide,
} from '@midwayjs/decorator'
import { FetchComponent } from '@mw-components/fetch'
import { Logger } from '@mw-components/jaeger'
import {
  timer,
  from as ofrom,
  Observable,
  Subscription,
  firstValueFrom,
} from 'rxjs'
import {
  concatMap,
  mergeMap,
} from 'rxjs/operators'

import { CallTaskOptions, TaskDTO, TaskState } from '../lib/index'

import { TaskQueueService } from './task-queue.service'


@Provide()
export class TaskAgentService {

  @Inject('jaeger:logger') protected readonly logger: Logger

  @Inject() readonly fetch: FetchComponent

  @Inject() protected readonly queueSvc: TaskQueueService

  protected readonly intv$ = timer(300, 10000)
  protected subscription: Subscription | undefined

  get isRunning(): boolean {
    const flag = this.subscription && ! this.subscription.closed
      ? true
      : false
    return flag
  }

  async run(): Promise<void> {
    const stream$ = this.pickTasksWaitToRun().pipe(
      mergeMap(rows => ofrom(rows)),
      mergeMap(task => this.sendTaskToRun(task), 2),
    )
    this.subscription = stream$.subscribe()
    return firstValueFrom(stream$).then(() => void 0)
  }

  stop(): void {
    this.subscription && this.subscription.unsubscribe()
  }

  private pickTasksWaitToRun(): Observable<TaskDTO[]> {
    const stream$ = this.intv$.pipe(
      concatMap(() => this.queueSvc.pickTasksWaitToRun({ maxRows: 5 })),
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
        await this.queueSvc.setState(taskId, TaskState.suspended)
          .catch(ex2 => this.logger.error(ex2))
        this.logger.error(ex)
      })
    return res
  }

  private async httpCall(options: CallTaskOptions): Promise<unknown> {
    const ret = this.fetch.fetch(options)
    // .then((res) => {
    //   console.info(res)
    //   return res
    // })
    return ret
  }
}

