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

import {
  CreateTaskDTO,
  ServerAgent,
  ServerMethod,
  SetProgressDTO,
  TaskDTO,
  TaskProgressDTO,
  TaskStatistics,
} from '../lib/index'
import { TaskQueueService } from '../service/index.service'


@Provide()
@Controller(ServerAgent.base)
export class TaskAgentController {

  @Inject() protected readonly queueSvc: TaskQueueService

  @Get('/' + ServerAgent.hello)
  [ServerMethod.hello](): string {
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
  async [ServerMethod.setRunning](@Query() id: TaskDTO['taskId']): Promise<TaskDTO | undefined> {
    const ret = await this.queueSvc.setRunning(id)
    return ret
  }

  @Get('/' + ServerAgent.setCancelled)
  async [ServerMethod.setCancelled](@Query() id: TaskDTO['taskId']): Promise<TaskDTO | undefined> {
    const ret = this.queueSvc.setCancelled(id)
    return ret
  }

  @Get('/' + ServerAgent.setFailed)
  async [ServerMethod.setFailed](@Query() id: TaskDTO['taskId']): Promise<TaskDTO | undefined> {
    const ret = await this.queueSvc.setFailed(id)
    return ret
  }

  @Get('/' + ServerAgent.setSucceeded)
  async [ServerMethod.setSucceeded](@Query() id: TaskDTO['taskId']): Promise<TaskDTO | undefined> {
    const ret = await this.queueSvc.setSucceeded(id)
    return ret
  }

  /**
   * @description task must in state pending
   */
  @Get('/' + ServerAgent.setProgress)
  async [ServerMethod.setProgress](@Query(ALL) input: SetProgressDTO): Promise<TaskProgressDTO | undefined> {
    const ret = await this.queueSvc.setProgress(input)
    return ret
  }

  @Get('/' + ServerAgent.getProgress)
  async [ServerMethod.getProgress](@Query() id: TaskDTO['taskId']): Promise<TaskProgressDTO | undefined> {
    const ret = await this.queueSvc.getProgress(id)
    return ret
  }

}

