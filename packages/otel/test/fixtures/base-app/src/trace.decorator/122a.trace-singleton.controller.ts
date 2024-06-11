import {
  Controller,
  Get,
  Inject,
} from '@midwayjs/core'
import { Context } from '@mwcp/share'

import { apiBase, apiMethod } from '../types/api-test.js'
import { Trace, TraceService } from '../types/index.js'

import { TraceSingletonService } from './122b.trace-singleton.service.js'


@Controller(apiBase.trace_singleton)
export class TraceController {

  @Inject() readonly traceSvc: TraceService
  @Inject() readonly svc: TraceSingletonService
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
    await this.svc.hello2({ input: 'hello2' }, this.ctx)
    return traceId
  }

}

