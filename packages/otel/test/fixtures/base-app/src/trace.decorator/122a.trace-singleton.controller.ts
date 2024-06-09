import {
  Controller,
  Get,
  Inject,
} from '@midwayjs/core'
import { MConfig } from '@mwcp/share'

import { Trace, TraceService } from '../types/index.js'
import { Config, ConfigKey } from '../types/lib-types.js'
import { apiBase, apiMethod } from '../types/api-test.js'

import { TraceSingletonService } from './122b.trace-singleton.service.js'


@Controller(apiBase.trace_singleton)
export class TraceController {

  @MConfig(ConfigKey.config) readonly config: Config

  @Inject() readonly traceSvc: TraceService
  @Inject() readonly svc: TraceSingletonService

  @Trace()
  @Get(`/${apiMethod.hello}`)
  async hello(): Promise<string> {
    const traceId = this.traceSvc.getTraceId()
    await this.svc.hello2('hello2')
    return traceId
  }

}

