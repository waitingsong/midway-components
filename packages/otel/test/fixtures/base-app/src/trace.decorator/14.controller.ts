import assert from 'node:assert'

import {
  Controller,
  Get,
  Inject,
} from '@midwayjs/core'
import { MConfig } from '@mwcp/share'

import { Trace, TraceService } from '../../../../../dist/lib/index.js'
import { Config, ConfigKey } from '../../../../../dist/lib/types.js'
import { apiBase, apiMethod } from '../../../../api-test.js'

import { DefaultComponentService } from './trace.service.js'


@Controller(apiBase.TraceDecorator)
export class DefaultComponentController {

  @MConfig(ConfigKey.config) readonly config: Config

  @Inject() readonly svc: DefaultComponentService
  @Inject() readonly traceSvc: TraceService

  @Trace()
  @Get(`/${apiMethod.decorator_arg2}`)
  async arg2(): Promise<string> {
    const traceId = this.traceSvc.getTraceId()
    const rnd = Math.round(Math.random() * 100)
    const str = 'bar'
    const msg = await this.svc.testArg2(rnd, str)
    assert(msg)

    const ret = `${traceId}:${rnd}:${str}`
    return ret
  }

}

