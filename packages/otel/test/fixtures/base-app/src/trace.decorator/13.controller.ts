import assert from 'node:assert'

import {
  Controller,
  Get,
  Inject,
} from '@midwayjs/core'
import { MConfig } from '@mwcp/share'

import { Trace, TraceService } from '../../../../../dist/lib/index.js'
import { Config, ConfigKey, Msg } from '../../../../../dist/lib/types.js'
import { apiBase, apiMethod } from '../../../../api-test.js'

import { DefaultComponentService } from './trace.service.js'


@Controller(apiBase.TraceDecorator)
export class DefaultComponentController {

  @MConfig(ConfigKey.config) readonly config: Config

  @Inject() readonly svc: DefaultComponentService
  @Inject() readonly traceSvc: TraceService

  @Trace()
  @Get(`/${apiMethod.decorator_arg}`)
  async arg(): Promise<string> {
    const traceId = this.traceSvc.getTraceId()
    const rnd = Math.random()
    const msg = await this.svc.testArg(rnd)
    assert(msg)
    const msg2 = this.svc.helloSync(Msg.hello)
    assert(msg2)

    // await this.traceSvc.flush()
    const ret = `${traceId}:${rnd}`
    return ret
  }

}

