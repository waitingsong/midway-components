import {
  Inject,
  Provide,
} from '@midwayjs/decorator'
import { Logger } from '@mw-components/jaeger'
import { mergeDoWithInitData } from '@mw-components/kmore'

import {
  CreateTaskDTO,
  initTaskDTO,
  initTaskPayloadDTO,
  TaskDTO,
  InitTaskDTO,
  TaskPayloadDTO,
  TaskProgressDTO,
  TaskState,
  TaskFullDTO,
  PickInitTaskOptions,
  initPickInitTasksOptions,
  TaskStatistics,
  SetProgressDTO,
  ServerMethod,
} from '../lib/index'
import { TaskQueueRepository } from '../repo/index.repo'


@Provide()
export class TaskQueueService {

  @Inject('jaeger:logger') protected readonly logger: Logger

  @Inject() protected readonly repo: TaskQueueRepository

  async [ServerMethod.create](input: CreateTaskDTO): Promise<TaskDTO> {
    const data: InitTaskDTO = mergeDoWithInitData(initTaskDTO, input)

    const ret = await this.repo.create(data)

    const payload: TaskPayloadDTO = {
      ...initTaskPayloadDTO,
      taskId: ret.taskId,
      json: input.json,
    }
    await this.repo.addTaskPayload(payload)
    return ret
  }

  async getInfo(id: TaskDTO['taskId']): Promise<TaskDTO | undefined> {
    const ret = this.repo.getInfo(id)
    return ret
  }

  async getFullInfo(id: TaskDTO['taskId']): Promise<TaskFullDTO | undefined> {
    const ret = this.repo.getFullInfo(id)
    return ret
  }

  async getPayload(id: TaskDTO['taskId']): Promise<TaskPayloadDTO | undefined> {
    const [ret] = await this.repo.getPayloads([id])
    return ret
  }

  async [ServerMethod.getProgress](
    id: TaskDTO['taskId'],
  ): Promise<TaskProgressDTO | undefined> {

    return this.repo.getProgress(id)
  }

  async setState(
    id: TaskDTO['taskId'],
    taskState: TaskDTO['taskState'],
  ): Promise<TaskDTO | undefined> {

    const ret = await this.repo.setState(id, taskState)
    if (! ret) {
      return
    }

    switch (taskState) {
      case TaskState.succeeded: {
        await this.repo.removeProgress([id])
        break
      }
      // case TaskState.running: {
      //   const { taskId } = ret
      //   const progess = await this.getProgress(taskId)
      //     .then(row => row?.taskProgress)

      //   if (! progess) {
      //     await this.setProgress({ taskId, taskProgress: 0 })
      //   }
      //   break
      // }
    }

    return ret
  }

  /**
   * @description task must in state pending or init, and tb_prgress FK constraint
   */
  async [ServerMethod.setRunning](
    id: TaskDTO['taskId'],
  ): Promise<TaskDTO | undefined> {

    const ret = this.repo.setRunning(id)
    await this.repo.initProgress(id)
    return ret
  }

  /**
   * Not in state succeeded, cancelled
   */
  async [ServerMethod.setFailed](
    id: TaskDTO['taskId'],
  ): Promise<TaskDTO | undefined> {

    const ret = this.repo.setFailed(id)
    return ret
  }

  /**
   * only in init, pending, running, cancelled
   */
  async [ServerMethod.setCancelled](
    id: TaskDTO['taskId'],
  ): Promise<TaskDTO | undefined> {

    const ret = this.repo.setCancelled(id)
    return ret
  }

  /**
   * only when running
   */
  async [ServerMethod.setSucceeded](
    id: TaskDTO['taskId'],
  ): Promise<TaskDTO | undefined> {

    const ret = this.repo.setSucceeded(id)
    return ret
  }

  async [ServerMethod.setProgress](
    options: SetProgressDTO,
  ): Promise<TaskProgressDTO | undefined> {

    const ret = this.repo.setProgress(options)
    return ret
  }

  /**
   * Pick tasks which state are init (to run),
   * and change the state to pending
   */
  async pickTasksWaitToRun(options?: Partial<PickInitTaskOptions>): Promise<TaskDTO[]> {
    const opts: PickInitTaskOptions = mergeDoWithInitData(
      initPickInitTasksOptions,
      options,
    )
    const ret = await this.repo.pickInitTasksToPending(opts)
    return ret
  }

  async [ServerMethod.stats](): Promise<TaskStatistics> {
    return this.repo.stats()
  }

}

