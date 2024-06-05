import assert from 'node:assert'

import {
  Controller,
  Get,
  Init,
  Inject,
  MidwayWebRouterService,
} from '@midwayjs/core'
import { MConfig } from '@mwcp/share'
import { sleep } from '@waiting/shared-core'

import { Trace, TraceService } from '../../../../../dist/lib/index.js'
import { TraceLogger, TraceAppLogger } from '../../../../../dist/lib/trace.logger.js'
import { Config, ConfigKey } from '../../../../../dist/lib/types.js'
import { apiBase, apiMethod } from '../../../../api-test.js'

import { DefaultComponentService } from './trace.service.js'


const scope1 = Symbol('scope1')
const scope2 = 'scope2'

@Controller(apiBase.decorator_data)
export class DecoratorScopeComponentController {

  @MConfig(ConfigKey.config) readonly config: Config

  @Inject() readonly svc: DefaultComponentService
  @Inject() readonly traceSvc: TraceService

  @Inject() readonly logger: TraceLogger
  @Inject() readonly appLogger: TraceAppLogger

  @Inject() webRouterService: MidwayWebRouterService

  @Init()
  async init(): Promise<void> {
    assert(true)
  }

  @Trace()
  @Get(`/${apiMethod.scope}`)
  async simple(): Promise<string> {
    const traceId = this.traceSvc.getTraceId()
    await this._simple1()
    await Promise.all([
      this._simple1(),
      this._simple2(),
    ])
    return traceId
  }

  // #region private methods

  @Trace<DecoratorScopeComponentController['_simple1']>({
    scope: scope1,
  })
  private async _simple1(): Promise<string> {
    await this._simple1a()
    return 'ok'
  }

  @Trace<DecoratorScopeComponentController['_simple2']>({
    scope: scope2,
  })
  private async _simple2(): Promise<string> {
    await sleep(1)
    this._simple2a()
    return 'ok'
  }

  // #region private methods sub

  @Trace<DecoratorScopeComponentController['_simple1a']>({
    scope: () => scope1,
  })
  private async _simple1a(): Promise<string> {
    return 'ok'
  }

  @Trace<DecoratorScopeComponentController['_simple2a']>({
    scope: scope2,
  })
  private _simple2a(): string {
    return 'ok'
  }
}

