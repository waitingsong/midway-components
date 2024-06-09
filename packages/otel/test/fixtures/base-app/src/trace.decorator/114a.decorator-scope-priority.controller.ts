import assert from 'node:assert'

import {
  Controller,
  Get,
  Inject,
} from '@midwayjs/core'
import { MConfig } from '@mwcp/share'
import { sleep } from '@waiting/shared-core'

import { Trace, TraceService, getScopeStringCache, TraceScopeParamType } from '../../../../../dist/lib/index.js'
import { Config, ConfigKey } from '../../../../../dist/lib/types.js'
import { apiBase, apiMethod } from '../../../../api-test.js'


const scope1 = Symbol('scope1')
const scope1a = Symbol('scope1a')
const scopeString = 'scope2'

@Controller(apiBase.decorator_data)
export class DecoratorScopeComponentController {

  @MConfig(ConfigKey.config) readonly config: Config

  @Inject() readonly traceSvc: TraceService

  @Trace()
  @Get(`/${apiMethod.scope_priority}`)
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
    scope: scope1,
    before: ([input], ctx) => {
      const { traceScope } = ctx
      assert(traceScope)
      assert(traceScope === scope1, 'traceScope !== scope1')
      input.traceScope = traceScope
      return void 0
    },
  })
  private async _simple1(input: InputOptions): Promise<string> {
    assert(input.traceScope, 'input.traceScope not assigned by before()')
    assert(input.traceScope === scope1, 'input.traceScope !== scope1')
    await this._simple1a(input)
    return 'ok'
  }

  @Trace<DecoratorScopeComponentController['_simple2']>({
    scope: scopeString,
    before: ([input], ctx) => {
      const { traceScope } = ctx
      assert(traceScope)
      const traceScope2 = getScopeStringCache(scopeString)
      assert(traceScope === traceScope2, 'traceScope !== symbol from scopeString')
      input.traceScope = traceScope
      return void 0
    },
  })
  private async _simple2(input: InputOptions): Promise<string> {
    assert(input.traceScope, 'input.traceScope not assigned by before()')
    await this._simple2a(input)
    return 'ok'
  }

  // #region private methods sub

  @Trace<DecoratorScopeComponentController['_simple1a']>({
    scope: scope1a, // will be override by input.traceScope in parent call's before()
    before: ([input], ctx) => {
      const { traceScope } = ctx
      assert(traceScope)
      assert(input.traceScope = traceScope)
      return void 0
    },
    after: ([input], _res, ctx) => {
      const { traceScope } = ctx
      assert(traceScope)
      assert(input.traceScope = traceScope)
      return void 0
    },
  })
  private async _simple1a(input: InputOptions): Promise<string> {
    assert(input.traceScope, 'input.traceScope not assigned by before()')
    assert(input.traceScope === scope1, 'input.traceScope !== scope1')
    return 'ok'
  }

  @Trace<DecoratorScopeComponentController['_simple2a']>({
    scope: scope1a, // will be override by input.traceScope in parent call's before()
    before: ([input], ctx) => {
      const { traceScope } = ctx
      assert(traceScope)
      assert(input.traceScope = traceScope)
      return void 0
    },
    after: ([input], _res, ctx) => {
      const { traceScope } = ctx
      assert(traceScope)
      assert(input.traceScope = traceScope)
      return void 0
    },
  })
  private async _simple2a(input: InputOptions): Promise<string> {
    assert(input.traceScope, 'input.traceScope not assigned by before()')
    return 'ok'
  }
}


interface InputOptions {
  traceScope?: TraceScopeParamType | undefined
  [key: PropertyKey]: unknown
}

