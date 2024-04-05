import assert from 'node:assert'

import {
  Controller,
  Get,
  Inject,
} from '@midwayjs/core'
import { MConfig } from '@mwcp/share'

import { Trace, TraceService } from '../../../../../dist/lib/index.js'
import { Config, ConfigKey, HeadersKey } from '../../../../../dist/lib/types.js'
import { propagateHeader } from '../../../../../dist/lib/util.js'
import { apiPrefix, apiRoute } from '../api-route.js'


@Controller(apiPrefix.util)
export class UtilController {

  @MConfig(ConfigKey.config) readonly config: Config

  @Inject() readonly traceSvc: TraceService

  @Trace()
  @Get(`/${apiRoute.propagateHeader}`)
  async propagateHeader(): Promise<'OK'> {
    const headers = new Headers()
    assert(headers)
    assert(! headers.get(HeadersKey.otelTraceId))

    headers.set('a', '1')
    assert(headers.get('a') === '1')

    const traceCtx = this.traceSvc.getActiveContext()
    propagateHeader(traceCtx, headers)
    assert(headers)
    const traceparent = headers.get(HeadersKey.otelTraceId)
    assert(traceparent)

    const traceId = this.traceSvc.getTraceId()
    const spanId = traceparent.split('-')[1]
    assert(spanId === traceId)


    const headers2 = new Headers()
    const txt = 'abc'
    headers2.set(HeadersKey.otelTraceId, txt)
    propagateHeader(traceCtx, headers2)
    const id2 = headers2.get(HeadersKey.otelTraceId)
    assert(id2 === txt)

    return 'OK'
  }


}

