import {
  Controller,
  Get,
  Inject,
} from '@midwayjs/core'
import { TraceService } from '@mwcp/otel'
import type { Context } from '@mwcp/share'

import {
  ClientURL,
  ClientMethod,
  TaskAgentState,
} from '##/lib/index.js'
import { TaskAgentService } from '##/service/index.service.js'


@Controller(ClientURL.base)
export class AgentController {

  @Inject() protected readonly ctx: Context
  @Inject() protected readonly traceService: TraceService
  @Inject() protected readonly agentSvc: TaskAgentService

  @Get('/' + ClientURL.start)
  async [ClientMethod.start](): Promise<TaskAgentState> {
    this.agentSvc.start()
    const taskAgentState = await this.status()
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

