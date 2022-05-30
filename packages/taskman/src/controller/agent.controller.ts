import {
  Controller,
  Get,
  Inject,
  Param,
} from '@midwayjs/decorator'
import { Span, SpanLogInput, TracerManager } from '@mw-components/jaeger'
import { genISO8601String } from '@waiting/shared-core'

import {
  ClientURL,
  ClientMethod,
  TaskAgentState,
} from '../lib/index'
import { TaskAgentService } from '../service/index.service'

import { Context } from '~/interface'


@Controller(ClientURL.base)
export class AgentController {

  @Inject() protected readonly ctx: Context
  @Inject() protected readonly tracerManager: TracerManager
  @Inject() protected readonly agentSvc: TaskAgentService

  @Get('/' + ClientURL.start)
  async [ClientMethod.start](): Promise<TaskAgentState> {
    const trm = this.tracerManager
    let span: Span | undefined

    await this.agentSvc.run(this.ctx, span)
    const taskAgentState = await this.status()

    if (trm) {
      const inputLog: SpanLogInput = {
        event: 'TaskAgent-run',
        taskAgentState,
        pid: process.pid,
        time: genISO8601String(),
      }
      span = trm.genSpan('TaskAgent')
      span.log(inputLog)
    }

    return taskAgentState
  }

  @Get('/' + ClientURL.stop)
  async stopNote(): Promise<string> {
    const ret = `Access ${ClientURL.base}/${ClientURL.stop}/$id to stop, $id from api ${ClientURL.base}/${ClientURL.status}`
    return ret
  }

  @Get('/' + ClientURL.stop + '/:agentId')
  async [ClientMethod.stop](@Param('agentId') id: string): Promise<TaskAgentState> {
    await this.agentSvc.stop(this.ctx, id)
    const ret = await this.status()
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

