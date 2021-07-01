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

  @Get('/' + ServerAgent.stats)
  async [ServerMethod.stats](): Promise<TaskStatistics> {
    const ret = await this.queueSvc.stats()
    return ret
  }

  @Get('/' + ServerAgent.setRunning)
  async [ServerMethod.setRunning](
    @Query() id: TaskDTO['taskId'],
      @Query() msg?: TaskLogDTO['taskLogContent'],
  ): Promise<TaskDTO | undefined> {

    const ret = await this.queueSvc.setRunning(id, msg)
    return ret
  }

  @Get('/' + ServerAgent.setCancelled)
  async [ServerMethod.setCancelled](
    @Query() id: TaskDTO['taskId'],
      @Query() msg?: TaskLogDTO['taskLogContent'],
  ): Promise<TaskDTO | undefined> {

    const ret = this.queueSvc.setCancelled(id, msg)
    return ret
  }

  @Get('/' + ServerAgent.setFailed)
  async [ServerMethod.setFailed](
    @Query() id: TaskDTO['taskId'],
      @Query() msg?: TaskLogDTO['taskLogContent'],
  ): Promise<TaskDTO | undefined> {

    const ret = await this.queueSvc.setFailed(id, msg)
    return ret
  }

  @Get('/' + ServerAgent.setSucceeded)
  async [ServerMethod.setSucceeded](
    @Query() id: TaskDTO['taskId'],
      @Query() result?: TaskResultDTO['json'],
  ): Promise<TaskDTO | undefined> {

    const ret = await this.queueSvc.setSucceeded(id, result)
    return ret
  }

  /**
   * @description task must in state pending
   */
  @Get('/' + ServerAgent.setProgress)
  async [ServerMethod.setProgress](
    @Query(ALL) input: SetProgressDTO,
      @Query() msg?: TaskLogDTO['taskLogContent'],
  ): Promise<TaskProgressDTO | undefined> {

    const ret = await this.queueSvc.setProgress(input, msg)
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

