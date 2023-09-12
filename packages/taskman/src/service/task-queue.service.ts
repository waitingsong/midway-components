import assert from 'node:assert'

import {
  Inject,
  Provide,
} from '@midwayjs/core'
import { mergeDoWithInitData } from '@mwcp/kmore'

import {
  CreateTaskDTO,
  initTaskDTO,
  initTaskPayloadDTO,
  TaskDTO,
  InitTaskDTO,
  TaskPayloadDTO,
  TaskProgressDTO,
  TaskFullDTO,
  PickInitTaskOptions,
  initPickInitTasksOptions,
  TaskStatistics,
  SetProgressDTO,
  ServerMethod,
  TaskLogDTO,
  TaskResultDTO,
  TaskProgressDetailDTO,
} from '##/lib/index.js'
import {
  TaskLogRepository,
  TaskQueueRepository,
  TaskResultRepository,
} from '##/repo/index.repo.js'


@Provide()
export class TaskQueueService {

  @Inject() protected readonly repo: TaskQueueRepository
  @Inject() protected readonly logRepo: TaskLogRepository
  @Inject() protected readonly retRepo: TaskResultRepository


  async [ServerMethod.create](input: CreateTaskDTO): Promise<TaskDTO> {
    const init: InitTaskDTO = {
      ...initTaskDTO,
      expectStart: new Date(),
    }
    const data: InitTaskDTO = mergeDoWithInitData(init, input)

    const ret = await this.repo.create(data)

    const payload: TaskPayloadDTO = {
      ...initTaskPayloadDTO,
      taskId: ret.taskId,
      json: input.json,
    }
    await this.repo.addTaskPayload(payload)
    await this.createLog(ret.taskId, 'create')
    return ret
  }

  async [ServerMethod.getInfo](id: TaskDTO['taskId']): Promise<TaskDTO | undefined> {
    const ret = await this.repo.getInfo(id)
    return ret
  }

  async getFullInfo(id: TaskDTO['taskId']): Promise<TaskFullDTO | undefined> {
    const ret = await this.repo.getFullInfo(id)
    return ret
  }

  async getPayload(id: TaskDTO['taskId']): Promise<TaskPayloadDTO | undefined> {
    const [ret] = await this.repo.getPayloads([id])
    return ret
  }

  async [ServerMethod.getProgress](
    id: TaskDTO['taskId'],
  ): Promise<TaskProgressDetailDTO | undefined> {

    const ret = await this.repo.getProgress(id)
    return ret
  }

  async [ServerMethod.getResult](
    id: TaskDTO['taskId'],
  ): Promise<TaskResultDTO | undefined> {

    const ret = await this.retRepo.read(id)
    return ret
  }

  async [ServerMethod.getLog](
    id: TaskDTO['taskId'],
  ): Promise<TaskLogDTO[]> {

    const ret = await this.logRepo.read(id)
    return ret
  }

  async setState(
    id: TaskDTO['taskId'],
    taskState: TaskDTO['taskState'],
    msg?: TaskLogDTO['taskLogContent'],
  ): Promise<TaskDTO | undefined> {

    const ret = await this.repo.setState(id, taskState)
    if (! ret) {
      return
    }

    // switch (taskState) {
    // case TaskState.succeeded: {
    //   await this.repo.removeProgress([id])
    //   break
    // }
    // case TaskState.running: {
    //   const { taskId } = ret
    //   const progess = await this.getProgress(taskId)
    //     .then(row => row?.taskProgress)

    //   if (! progess) {
    //     await this.setProgress({ taskId, taskProgress: 0 })
    //   }
    //   break
    // }
    // }
    await this.createLog(ret.taskId, msg)

    return ret
  }

  /**
   * @description task must in state pending or init, and tb_prgress FK constraint
   */
  async [ServerMethod.setRunning](
    id: TaskDTO['taskId'],
    msg?: TaskLogDTO['taskLogContent'],
  ): Promise<TaskDTO | undefined> {

    const ret = await this.repo.setRunning(id)
    if (! ret) {
      return
    }
    await this.repo.initProgress(id)
    await this.createLog(id, msg)
    return ret
  }

  /**
   * Not in state succeeded, cancelled
   */
  async [ServerMethod.setFailed](
    id: TaskDTO['taskId'],
    msg?: TaskLogDTO['taskLogContent'],
  ): Promise<TaskDTO | undefined> {

    const ret = await this.repo.setFailed(id)
    await this.createLog(ret?.taskId, msg)
    return ret
  }

  /**
   * only in init, pending, running, cancelled
   */
  async [ServerMethod.setCancelled](
    id: TaskDTO['taskId'],
    msg?: TaskLogDTO['taskLogContent'],
  ): Promise<TaskDTO | undefined> {

    const ret = await this.repo.setCancelled(id)
    await this.createLog(ret?.taskId, msg)
    return ret
  }

  /**
   * only when running
   */
  async [ServerMethod.setSucceeded](
    id: TaskDTO['taskId'],
    result?: TaskResultDTO['json'],
  ): Promise<TaskDTO | undefined> {

    const ret = await this.repo.setSucceeded(id)
    await this.createResult(ret?.taskId, result)
    return ret
  }

  async [ServerMethod.setProgress](
    options: SetProgressDTO,
    msg?: TaskLogDTO['taskLogContent'],
  ): Promise<TaskProgressDTO | undefined> {

    const ret = await this.repo.setProgress(options)
    await this.createLog(ret?.taskId, msg)
    return ret
  }

  /**
   * Pick tasks which state are init to run,
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


  async assertsTaskExists(id: TaskDTO['taskId']): Promise<void> {
    const ret = await this.repo.assertsTaskExists(id)
    assert(ret, `task ${id} not exists`)
  }

  async createLog(
    id?: TaskDTO['taskId'],
    msg?: TaskLogDTO['taskLogContent'],
  ): Promise<TaskLogDTO | undefined> {

    if (id && msg && typeof msg === 'string') {
      const ret = await this.logRepo.create({
        taskId: id,
        taskLogContent: msg.trim(),
        ctime: 'now()',
      })
      return ret
    }
    return
  }

  async createResult(
    id?: TaskDTO['taskId'],
    result?: TaskResultDTO['json'],
  ): Promise<TaskResultDTO | undefined> {

    if (id && result) {
      return this.retRepo.create({
        taskId: id,
        json: result,
        ctime: 'now()',
      })
    }
    return
  }

}

