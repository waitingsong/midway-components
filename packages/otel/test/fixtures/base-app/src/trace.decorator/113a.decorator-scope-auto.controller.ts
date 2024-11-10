import assert from 'node:assert'

import {
  Controller,
  Get,
  Inject,
} from '@midwayjs/core'
import { MConfig } from '@mwcp/share'
import { sleep } from '@waiting/shared-core'

import { apiBase, apiMethod } from '../types/api-test.js'
import { type TraceContext, Trace, TraceService } from '../types/index.js'
import { Config, ConfigKey } from '../types/lib-types.js'


@Controller(apiBase.decorator_data)
export class DecoratorScopeComponentController {

  @MConfig(ConfigKey.config) readonly config: Config

  @Inject() readonly traceSvc: TraceService

  @Trace()
  @Get(`/${apiMethod.trace_auto_scope}`)
  async simple(): Promise<string> {
    const traceId = this.traceSvc.getTraceId()
    const opts1: InputOptions = { }
    const opts2: InputOptions = { }
    await this._simple1(opts1)
    await Promise.all([
      this._simple1(opts1),
      Promise.resolve().then(async () => {
        await sleep(1) // make sure the order of the two methods
        return this._simple2(opts2)
      }),
    ])
    return traceId
  }

  // #region private methods

  @Trace<DecoratorScopeComponentController['_simple1']>({
    before: ([input], ctx) => {
      const { traceContext } = ctx
      assert(traceContext)
      input.traceContext = traceContext
      return null
    },
  })
  private async _simple1(input: InputOptions): Promise<string> {
    assert(input.traceContext, 'input.traceScope not assigned by before()')
    await this._simple1a(input)
    return 'ok'
  }

  @Trace<DecoratorScopeComponentController['_simple2']>({
    before: ([input], ctx) => {
      const { traceContext } = ctx
      assert(traceContext)
      input.traceContext = traceContext
      return null
    },
  })
  private async _simple2(input: InputOptions): Promise<string> {
    assert(input.traceContext, 'input.traceScope not assigned by before()')
    await this._simple2a(input)
    return 'ok'
  }

  // #region private methods sub

  @Trace<DecoratorScopeComponentController['_simple1a']>({
    before: ([input], ctx) => {
      const { traceContext } = ctx
      assert(traceContext)
      input.traceContext = traceContext
      return null
    },
    after: ([input], _res, ctx) => {
      const { traceContext } = ctx
      assert(input.traceContext === traceContext)
      return void 0
    },
  })
  private async _simple1a(input: InputOptions): Promise<string> {
    assert(input.traceContext, 'input.traceScope not assigned by before()')
    return 'ok'
  }

  @Trace<DecoratorScopeComponentController['_simple2a']>({
    before: ([input], ctx) => {
      const { traceContext } = ctx
      assert(traceContext)
      input.traceContext = traceContext
      return null
    },
    after: ([input], _res, ctx) => {
      const { traceContext } = ctx
      assert(traceContext)
      assert(input.traceContext = traceContext)
      return null
    },
  })
  private async _simple2a(input: InputOptions): Promise<string> {
    assert(input.traceContext, 'input.traceScope not assigned by before()')
    return 'ok'
  }
}


interface InputOptions {
  traceContext?: TraceContext | undefined
  [key: PropertyKey]: unknown
}

