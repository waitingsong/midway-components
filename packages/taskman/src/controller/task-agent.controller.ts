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
import { Span, SpanLogInput } from '@mw-components/jaeger'
import { genISO8601String } from '@waiting/shared-core'

import {
  CommonSetMethodInputData,
  CreateTaskDTO,
  SetProgressInputData,
  ServerAgent,
  ServerMethod,
  SetProgressDTO,
  TaskDTO,
  TaskProgressDetailDTO,
  TaskProgressDTO,
  TaskResultDTO,
  TaskStatistics,
  TaskPayloadDTO,
  SetStateInputData,
  AgentConcurrentConfig,
  agentConcurrentConfig,
} from '../lib/index'
import { TaskAgentService, TaskQueueService } from '../service/index.service'

import { Context } from '~/interface'


@Provide()
@Controller(ServerAgent.base)
export class TaskAgentController {

  @Inject() protected readonly ctx: Context
  @Inject() protected readonly agentSvc: TaskAgentService
  @Inject() protected readonly queueSvc: TaskQueueService

  @Get('/' + ServerAgent.start)
  async [ServerMethod.start](): Promise<AgentConcurrentConfig> {

    const trm = this.ctx.tracerManager
    let span: Span | undefined
    if (trm) {
      const inputLog: SpanLogInput = {
        event: 'TaskAgent-run',
        agentConcurrentConfig,
        pid: process.pid,
        time: genISO8601String(),
      }
      span = trm.genSpan('TaskAgent')
      span.log(inputLog)
    }

    if (agentConcurrentConfig.count < agentConcurrentConfig.max) {
      await this.agentSvc.run(span)
    }

    return agentConcurrentConfig
  }

  // @Get('/' + ServerAgent.stop)
  // async [ServerMethod.stop](): Promise<AgentConcurrentConfig> {
  //   this.agentSvc.stop()
  //   return agentConcurrentConfig
  // }

  @Get('/' + ServerAgent.hello)
  [ServerMethod.hello](): string {
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
    @Body(ALL) input: CommonSetMethodInputData,
  ): Promise<TaskDTO | undefined> {

    const { id, msg } = input
    const ret = this.queueSvc.setCancelled(id, msg)
    return ret
  }

  @Post('/' + ServerAgent.setFailed)
  async [ServerMethod.setFailed](
    @Body(ALL) input: CommonSetMethodInputData,
  ): Promise<TaskDTO | undefined> {

    const { id, msg } = input
    const ret = await this.queueSvc.setFailed(id, msg)
    return ret
  }

  @Post('/' + ServerAgent.setSucceeded)
  async [ServerMethod.setSucceeded](
    @Body(ALL) input: CommonSetMethodInputData,
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
    @Body(ALL) input: SetProgressInputData,
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

  @Get('/' + ServerAgent.pickTasksWaitToRun)
  async [ServerMethod.pickTasksWaitToRun](): Promise<TaskDTO[]> {
    const ret = await this.queueSvc.pickTasksWaitToRun({ maxRows: 1 })
    return ret
  }

  @Get('/' + ServerAgent.getPayload)
  async [ServerMethod.getPayload](
    @Query() id: TaskDTO['taskId'],
  ): Promise<TaskPayloadDTO | undefined> {

    const ret = await this.queueSvc.getPayload(id)
    return ret
  }

  @Post('/' + ServerAgent.setState)
  async [ServerMethod.setState](
    @Body(ALL) input: SetStateInputData,
  ): Promise<TaskDTO | undefined> {

    const { id, state, msg } = input
    const ret = await this.queueSvc.setState(id, state, msg)
    return ret
  }

}

