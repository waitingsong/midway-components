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
} from '../lib/index'
import { TaskAgentService } from '../service/index.service'

import { Context } from '~/interface'


@Controller(ClientURL.base)
export class AgentController {

  @Inject() protected readonly ctx: Context
  @Inject() protected readonly tracerManager: TracerManager
  @Inject() protected readonly agentSvc: TaskAgentService

  @Get('/' + ClientURL.start)
  async [ServerMethod.startOne](): Promise<string> {
    const trm = this.tracerManager
    let span: Span | undefined

    const agentId = this.agentSvc.id
    if (! this.agentSvc.isRunning) {
      await this.agentSvc.run(span)
    }

    const ret = agentId

    if (trm) {
      const inputLog: SpanLogInput = {
        event: 'TaskAgent-run',
        agentId,
        pid: process.pid,
        time: genISO8601String(),
      }
      span = trm.genSpan('TaskAgent')
      span.log(inputLog)
    }

    return ret
  }

  @Get('/' + ClientURL.stop)
  async [ServerMethod.stop](): Promise<'OK'> {
    this.agentSvc.stop()
    return 'OK'
  }

  @Get('/' + ClientURL.hello)
  [ServerMethod.hello](): 'OK' {
    return 'OK'
  }

}

