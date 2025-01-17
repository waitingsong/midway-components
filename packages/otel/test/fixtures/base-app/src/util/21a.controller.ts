import assert from 'node:assert'

import {
  Controller,
  Get,
  Inject,
  Post,
} from '@midwayjs/core'
import { Context, MConfig } from '@mwcp/share'

import { apiBase, apiMethod } from '../types/api-test.js'
import { Trace, TraceService } from '../types/index.js'
import { Config, ConfigKey } from '../types/lib-types.js'
import { deleteSpan, getSpan, isSpanEnded } from '../types/util.js'


@Controller(apiBase.util)
export class UtilComponentController {

  @MConfig(ConfigKey.config) readonly config: Config

  @Inject() readonly ctx: Context
  @Inject() readonly traceSvc: TraceService

  @Trace({
    spanName: '',
  })
  @Get(`/${apiMethod.hello}`)
  @Post(`/${apiMethod.hello}`)
  async simple(): Promise<string> {
    const traceId = this.traceSvc.getTraceId()
    const traceId2 = this.traceSvc.otel.getTraceId()
    assert(traceId, 'traceId should not be empty')
    assert(traceId2, 'traceId2 should not be empty')
    await this._simple1()
    return traceId
  }

  // #region private methods

  @Trace({
    spanName: () => '',
  })
  private async _simple1(): Promise<string> {
    const { span, traceContext } = this.traceSvc.startScopeSpan({ name: 'simple1', scope: this.ctx })
    assert(span)
    assert(! isSpanEnded(span))

    const traceCtx2 = this.traceSvc.getActiveContext()
    assert(traceCtx2)
    assert(traceCtx2 !== traceContext)

    const span2 = getSpan(traceCtx2)
    assert(span2)
    assert(span2 !== span)

    const traceCtx3 = deleteSpan(traceCtx2)
    const span3 = getSpan(traceCtx3)
    assert(! span3, 'span3 should be undefined')

    const span2a = getSpan(traceCtx2)
    assert(span2a)
    assert(span2a !== span)

    return 'ok'
  }

}

