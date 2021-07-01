import {
  ALL,
  Controller,
  Get,
  Inject,
  Provide,
  Body,
  Post,
  Query,
} from '@midwayjs/decorator'

import { decreaseRunningTaskCount } from '../lib/helper'
import {
  CreateTaskDTO,
  ServerAgent,
  ServerMethod,
  SetProgressDTO,
  TaskDTO,
  TaskLogDTO,
  TaskProgressDetailDTO,
  TaskProgressDTO,
  TaskResultDTO,
  TaskStatistics,
} from '../lib/index'
import { TaskQueueService } from '../service/index.service'


@Provide()
@Controller(ServerAgent.base)
export class TaskAgentController {

  @Inject() protected readonly queueSvc: TaskQueueService

  @Get('/' + ServerAgent.hello)
  [ServerMethod.hello](): string {
    decreaseRunningTaskCount()
    return 'OK'
  }

  @Post('/' + ServerAgent.create)
  async [ServerMethod.create](@Body(ALL) input: CreateTaskDTO): Promise<TaskDTO> {
    const ret = await this.queueSvc.create(input)
    return ret
  }

  @Get('/' + ServerAgent.getInfo)
  async [ServerMethod.getInfo](@Query() id: TaskDTO['taskId']): Promise<TaskDTO | undefined> {
    const ret = await this.queueSvc.getInfo(id)
    return ret
  }

  @Get('/' + ServerAgent.stats)
  async [ServerMethod.stats](): Promise<TaskStatistics> {
    const ret = await this.queueSvc.stats()
    return ret
  }

  @Post('/' + ServerAgent.setRunning)
  async [ServerMethod.setRunning](
    @Body(ALL) input: CommonSetMethodInputData,
  ): Promise<TaskDTO | undefined> {

    const { id, msg } = input
    const ret = await this.queueSvc.setRunning(id, msg)
    return ret
  }

  @Post('/' + ServerAgent.setCancelled)
  async [ServerMethod.setCancelled](
    @Query(ALL) input: CommonSetMethodInputData,
  ): Promise<TaskDTO | undefined> {

    const { id, msg } = input
    const ret = this.queueSvc.setCancelled(id, msg)
    return ret
  }

  @Post('/' + ServerAgent.setFailed)
  async [ServerMethod.setFailed](
    @Query(ALL) input: CommonSetMethodInputData,
  ): Promise<TaskDTO | undefined> {

    const { id, msg } = input
    const ret = await this.queueSvc.setFailed(id, msg)
    return ret
  }

  @Post('/' + ServerAgent.setSucceeded)
  async [ServerMethod.setSucceeded](
    @Query(ALL) input: CommonSetMethodInputData,
  ): Promise<TaskDTO | undefined> {

    const { id, msg: result } = input
    const ret = await this.queueSvc.setSucceeded(id, result)
    return ret
  }

  /**
   * @description task must in state pending
   */
  @Post('/' + ServerAgent.setProgress)
  async [ServerMethod.setProgress](
    @Query(ALL) input: SetProgressInputData,
  ): Promise<TaskProgressDTO | undefined> {

    const info: SetProgressDTO = {
      taskId: input.id,
      taskProgress: input.progress,
    }
    const ret = await this.queueSvc.setProgress(info, input.msg)
    return ret
  }

  @Get('/' + ServerAgent.getProgress)
  async [ServerMethod.getProgress](
    @Query() id: TaskDTO['taskId'],
  ): Promise<TaskProgressDetailDTO | undefined> {

    const ret = await this.queueSvc.getProgress(id)
    return ret
  }

  @Get('/' + ServerAgent.getResult)
  async [ServerMethod.getResult](@Query() id: TaskDTO['taskId']): Promise<TaskResultDTO | undefined> {
    const ret = await this.queueSvc.getResult(id)
    return ret
  }

}


export interface CommonSetMethodInputData {
  id: TaskDTO['taskId']
  msg?: TaskLogDTO['taskLogContent']
}
export interface SetProgressInputData extends CommonSetMethodInputData {
  progress: TaskProgressDTO['taskProgress']
}
