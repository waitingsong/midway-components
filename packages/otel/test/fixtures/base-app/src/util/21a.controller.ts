import assert from 'assert'

import {
  Controller,
  Get,
  Inject,
  Post,
} from '@midwayjs/core'
import { MConfig } from '@mwcp/share'

import { Trace, TraceService } from '../types/index.js'
import { Config, ConfigKey } from '../types/lib-types.js'
import { isSpanEnded, deleteSpan, getSpan } from '../types/util.js'
import { apiBase, apiMethod } from '../types/api-test.js'


@Controller(apiBase.util)
export class UtilComponentController {

  @MConfig(ConfigKey.config) readonly config: Config

  @Inject() readonly traceSvc: TraceService

  @Trace({
    spanName: '',
  })
  @Get(`/${apiMethod.hello}`)
  @Post(`/${apiMethod.hello}`)
  async simple(): Promise<string> {
    const traceId = this.traceSvc.getTraceId()
    const traceId2 = this.traceSvc.otel.getTraceId()
    assert(! traceId2)
    await this._simple1()
    return traceId
  }

  // #region private methods

  @Trace({
    spanName: () => '',
  })
  private async _simple1(): Promise<string> {
    const span = this.traceSvc.startScopeActiveSpan({ name: 'simple1' })
    assert(span)
    assert(! isSpanEnded(span))

    const traceCtx2 = this.traceSvc.getActiveContext()
    assert(traceCtx2)

    const span2 = getSpan(traceCtx2)
    assert(span2)
    assert(span2 === span)

    const traceCtx3 = deleteSpan(traceCtx2)
    const span3 = getSpan(traceCtx3)
    assert(! span3, 'span3 should be undefined')

    const span2a = getSpan(traceCtx2)
    assert(span2a)
    assert(span2a === span)

    const traceCtx5 = this.traceSvc.getActiveContext()
    assert(traceCtx5)
    assert(traceCtx5 === traceCtx2)

    const span5 = getSpan(traceCtx5)
    assert(span5)
    assert(span5 === span)

    return 'ok'
  }

}

