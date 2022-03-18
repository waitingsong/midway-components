import {
  Controller,
  Get,
  Inject,
} from '@midwayjs/decorator'
import { Span, SpanLogInput, TracerManager } from '@mw-components/jaeger'
import { genISO8601String } from '@waiting/shared-core'

import {
  ClientURL,
  ServerMethod,
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
  async [ServerMethod.startOne](): Promise<TaskAgentState> {
    const trm = this.tracerManager
    let span: Span | undefined

    const agentId = this.agentSvc.id
    await this.agentSvc.run(this.ctx, span)

    const taskAgentState: TaskAgentState = {
      agentId,
      count: this.agentSvc.runnerSet.size,
    }

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
  async [ServerMethod.stop](): Promise<'OK'> {
    await this.agentSvc.stop(this.ctx)
    return 'OK'
  }

  @Get('/' + ClientURL.hello)
  [ServerMethod.hello](): 'OK' {
    return 'OK'
  }

}

