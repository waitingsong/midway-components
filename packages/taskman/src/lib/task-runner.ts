import { TaskManComponent } from './task-man.component'

import {
  TaskDTO,
  TaskLogDTO,
  TaskProgressDetailDTO,
  TaskProgressDTO,
  TaskResultDTO,
} from './index'


export class TaskRunner {

  constructor(
    readonly taskInfo: TaskDTO,
    readonly taskMan: TaskManComponent,
  ) { }

  async setRunning(
    msg?: TaskLogDTO['taskLogContent'],
  ): Promise<TaskDTO | undefined> {

    const { taskId } = this.taskInfo
    const ret = await this.taskMan.setRunning(taskId, msg)
    return ret
  }

  notifyRunning(
    msg?: TaskLogDTO['taskLogContent'],
  ): void {

    this.setRunning(msg).catch(ex => this.taskMan.logger.error(ex))
  }

  async setCancelled(
    msg?: TaskLogDTO['taskLogContent'],
  ): Promise<TaskDTO | undefined> {

    const { taskId } = this.taskInfo
    const ret = await this.taskMan.setCancelled(taskId, msg)
    return ret
  }

  notifyCancelled(
    msg?: TaskLogDTO['taskLogContent'],
  ): void {

    this.setCancelled(msg).catch(ex => this.taskMan.logger.error(ex))
  }

  async setFailed(
    msg?: TaskLogDTO['taskLogContent'],
  ): Promise<TaskDTO | undefined> {

    const { taskId } = this.taskInfo
    const ret = await this.taskMan.setFailed(taskId, msg)
    return ret
  }

  notifyFailed(
    msg?: TaskLogDTO['taskLogContent'],
  ): void {

    this.setFailed(msg).catch(ex => this.taskMan.logger.error(ex))
  }

  async setSucceeded(
    result?: TaskResultDTO['json'],
  ): Promise<TaskDTO | undefined> {

    const { taskId } = this.taskInfo
    const ret = await this.taskMan.setSucceeded(taskId, result)
    return ret
  }

  notifySucceeded(
    result?: TaskResultDTO['json'],
  ): void {

    this.setSucceeded(result).catch(ex => this.taskMan.logger.error(ex))
  }

  async setProgress(
    progress: TaskProgressDTO['taskProgress'],
    msg?: TaskLogDTO['taskLogContent'],
  ): Promise<TaskDTO | undefined> {

    const { taskId } = this.taskInfo
    const ret = await this.taskMan.setProgress(taskId, progress, msg)
    return ret
  }

  notifyProgress(
    progress: TaskProgressDTO['taskProgress'],
    msg?: TaskLogDTO['taskLogContent'],
  ): void {

    this.setProgress(progress, msg).catch(ex => this.taskMan.logger.error(ex))
  }

  async getProgress(): Promise<TaskProgressDetailDTO | undefined> {
    const { taskId } = this.taskInfo
    const ret = await this.taskMan.getProgress(taskId)
    return ret
  }

}


export function taskFactory(
  taskInfo: TaskDTO,
  taskMan: TaskManComponent,
): TaskRunner {
  return new TaskRunner(taskInfo, taskMan)
}
