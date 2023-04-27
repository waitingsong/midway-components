import assert from 'node:assert'

import {
  Config as _Config,
  Controller,
  Get,
  Inject,
} from '@midwayjs/core'

import { Trace, TraceService } from '~/lib/index'
import { Config, ConfigKey } from '~/lib/types'
import { propagateHeader } from '~/lib/util'

import { apiPrefix, apiRoute } from '../api-route'


@Controller(apiPrefix.util)
export class UtilController {

  @_Config(ConfigKey.config) readonly config: Config

  @Inject() readonly traceSvc: TraceService

  @Trace()
  @Get(`/${apiRoute.propagateHeader}`)
  async propagateHeader(): Promise<'OK'> {
    const headers = new Headers()
    assert(headers)
    assert(! headers.get('traceparent'))

    headers.set('a', '1')
    assert(headers.get('a') === '1')

    const traceCtx = this.traceSvc.getActiveContext()
    propagateHeader(traceCtx, headers)
    assert(headers)
    const traceparent = headers.get('traceparent')
    assert(traceparent)

    const traceId = this.traceSvc.getTraceId()
    const spanId = traceparent.split('-')[1]
    assert(spanId === traceId)

    return 'OK'
  }


}

