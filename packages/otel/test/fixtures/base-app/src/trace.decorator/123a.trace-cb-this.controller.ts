import {
  Controller,
  Get,
  Inject,
} from '@midwayjs/core'
import { Context } from '@mwcp/share'

import { apiBase, apiMethod } from '../types/api-test.js'
import { Trace, TraceService } from '../types/index.js'

import { TraceSingletonThisService } from './123b.trace-cb-this.service.js'


@Controller(apiBase.trace_this)
export class TraceThisController {

  @Inject() readonly traceSvc: TraceService
  @Inject() readonly svc: TraceSingletonThisService
  @Inject() readonly ctx: Context

  @Trace()
  @Get(`/${apiMethod.home}`)
  async home(): Promise<string> {
    const traceId = this.traceSvc.getTraceId()
    await this.svc.home({ input: 'hello', webContext: this.ctx })
    return traceId
  }

  @Trace()
  @Get(`/${apiMethod.hello}`)
  async hello(): Promise<string> {
    const traceId = this.traceSvc.getTraceId()
    this.svc.hello2({ input: 'hello2' }, this.ctx)
    return traceId
  }

}

