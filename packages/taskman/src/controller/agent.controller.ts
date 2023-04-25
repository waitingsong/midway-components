import {
  Controller,
  Get,
  Inject,
} from '@midwayjs/core'
import { TraceService, Attributes } from '@mwcp/otel'
import type { Context } from '@mwcp/share'
import { genISO8601String } from '@waiting/shared-core'

import {
  ClientURL,
  ClientMethod,
  TaskAgentState,
} from '../lib/index'
import { TaskAgentService } from '../service/index.service'



@Controller(ClientURL.base)
export class AgentController {

  @Inject() protected readonly ctx: Context
  @Inject() protected readonly traceService: TraceService
  @Inject() protected readonly agentSvc: TaskAgentService

  @Get('/' + ClientURL.start)
  async [ClientMethod.start](): Promise<TaskAgentState> {
    const span = this.traceService.startSpan('TaskAgent')

    this.agentSvc.start()
    const taskAgentState = await this.status()

    const event: Attributes = {
      event: 'TaskAgent-run',
      taskAgentState: JSON.stringify(taskAgentState, null, 2),
      pid: process.pid,
      time: genISO8601String(),
    }
    this.traceService.addEvent(span, event)

    return taskAgentState
  }

  @Get('/' + ClientURL.stop)
  async stopNote(): Promise<TaskAgentState> {
    // const ret = `Access ${ClientURL.base}/${ClientURL.stop}/$id to stop, $id from api ${ClientURL.base}/${ClientURL.status}`
    this.agentSvc.stop()
    const ret = this.agentSvc.status()
    return ret
  }


  @Get('/' + ClientURL.status)
  async [ClientMethod.status](): Promise<TaskAgentState> {
    const status = this.agentSvc.status()
    return status
  }

  @Get('/' + ClientURL.hello)
  async [ClientMethod.hello](): Promise<'OK'> {
    return 'OK'
  }

}

