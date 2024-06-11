import {
  Controller,
  Get,
  Inject,
} from '@midwayjs/core'
import { MConfig } from '@mwcp/share'

import { apiBase, apiMethod } from '../types/api-test.js'
import { TraceService } from '../types/index.js'
import { Config, ConfigKey, Msg } from '../types/lib-types.js'

import { DefaultComponentService } from './trace.service.js'


@Controller(apiBase.TraceDecorator)
export class DefaultComponentController {

  @MConfig(ConfigKey.config) readonly config: Config

  @Inject() readonly svc: DefaultComponentService
  @Inject() readonly traceSvc: TraceService

  @Get(`/${apiMethod.id}`)
  async traceId(): Promise<string> {
    const traceId = this.traceSvc.getTraceId()
    await this.svc.hello(Msg.hello)
    this.traceSvc.setAttributes(void 0, { foo: 'foo' })
    // ensure child span of svc.hello is sent, to keep span order for unit test validation
    // await this.traceSvc.flush()
    return traceId
  }

}

