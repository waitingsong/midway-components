import assert from 'node:assert'

import {
  Controller,
  Get,
  Inject,
} from '@midwayjs/core'
import { Context, MConfig } from '@mwcp/share'

import { apiBase, apiMethod } from '../types/api-test.js'
import { Trace, TraceService } from '../types/index.js'
import { Config, ConfigKey, HeadersKey } from '../types/lib-types.js'
import { propagateHeader } from '../types/util.js'


@Controller(apiBase.util)
export class UtilController {

  @MConfig(ConfigKey.config) readonly config: Config

  @Inject() readonly ctx: Context
  @Inject() readonly traceSvc: TraceService

  @Trace()
  @Get(`/${apiMethod.propagateHeader}`)
  async propagateHeader(): Promise<'OK'> {
    const headers = new Headers()
    assert(headers)
    assert(! headers.get(HeadersKey.TRACE_PARENT_HEADER))

    headers.set('a', '1')
    assert(headers.get('a') === '1')

    const traceCtx = this.traceSvc.getActiveContext()
    propagateHeader(traceCtx, headers)
    assert(headers)
    const traceParent = headers.get(HeadersKey.TRACE_PARENT_HEADER)
    assert(traceParent)

    const traceId = this.traceSvc.getTraceId()
    const spanId = traceParent.split('-')[1]
    assert(spanId === traceId)


    const headers2 = new Headers()
    const txt = 'abc'
    headers2.set(HeadersKey.TRACE_PARENT_HEADER, txt)
    propagateHeader(traceCtx, headers2)
    const id2 = headers2.get(HeadersKey.TRACE_PARENT_HEADER)
    assert(id2 === txt)

    return 'OK'
  }


}

