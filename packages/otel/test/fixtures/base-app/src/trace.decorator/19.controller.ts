import {
  Controller,
  Get,
  Inject,
} from '@midwayjs/core'
import { MConfig } from '@mwcp/share'

import { apiBase, apiMethod } from '../types/api-test.js'
import { TraceService } from '../types/index.js'
import { Config, ConfigKey, Msg } from '../types/lib-types.js'

import { SingletonService as DefaultComponentService } from './19b.singleton.service.js'


@Controller(apiBase.define_scope)
export class DefaultComponentController {

  @MConfig(ConfigKey.config) readonly config: Config

  @Inject() readonly svc: DefaultComponentService
  @Inject() readonly traceSvc: TraceService

  @Get(`/${apiMethod.hello}`)
  async traceId(): Promise<string> {
    const traceId = this.traceSvc.getTraceId()
    await this.svc.hello(Msg.hello)
    return traceId
  }

}

