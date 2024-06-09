import {
  Controller,
  Get,
  Inject,
} from '@midwayjs/core'
import { MConfig } from '@mwcp/share'

import { Trace, TraceService } from '../types/index.js'
import { Config, ConfigKey, Msg } from '../types/lib-types.js'
import { apiBase, apiMethod } from '../types/api-test.js'

import { DefaultComponentService } from './trace.service.js'


@Controller(apiBase.route)
export class RouteComponentController {

  @MConfig(ConfigKey.config) readonly config: Config

  @Inject() readonly svc: DefaultComponentService
  @Inject() readonly traceSvc: TraceService

  @Trace()
  @Get(`/${apiMethod.hello}/:id`)
  async traceId(): Promise<string> {
    const traceId = this.traceSvc.getTraceId()
    await this.svc.hello(Msg.hello)
    this.traceSvc.setAttributes(void 0, { helloFoo: 'helloFoo' })
    // ensure child span of svc.hello is sent, to keep span order for unit test validation
    await this.traceSvc.flush()
    return traceId
  }

}

