import assert from 'node:assert'

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


@Controller(apiBase.TraceDecorator)
export class DefaultComponentController {

  @MConfig(ConfigKey.config) readonly config: Config

  @Inject() readonly svc: DefaultComponentService
  @Inject() readonly traceSvc: TraceService

  @Trace()
  @Get(`/${apiMethod.id2}`)
  async traceId2(): Promise<string> {
    const traceId = this.traceSvc.getTraceId()
    this.traceSvc.setAttributesLater(void 0, { bar: 'bar' })
    const msg = await this.svc.hello(Msg.hello)
    assert(msg)

    const msg2 = this.svc.helloSync(Msg.hello)
    assert(typeof msg2 === 'string')
    assert(msg2)

    // await this.traceSvc.flush()
    return traceId
  }

}

