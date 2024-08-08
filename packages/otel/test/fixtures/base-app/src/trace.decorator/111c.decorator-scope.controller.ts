import {
  Controller,
  Get,
  Inject,
} from '@midwayjs/core'
import { MConfig } from '@mwcp/share'
import { sleep } from '@waiting/shared-core'

import { apiBase, apiMethod } from '../types/api-test.js'
import { Trace, TraceService } from '../types/index.js'
import { Config, ConfigKey } from '../types/lib-types.js'


const scope1 = Symbol('scope1')

@Controller(apiBase.decorator_data)
export class DecoratorScopeComponentController {

  @MConfig(ConfigKey.config) readonly config: Config

  @Inject() readonly traceSvc: TraceService

  @Trace()
  @Get(`/${apiMethod.simple_scope}`)
  async simple(): Promise<string> {
    const traceId = this.traceSvc.getTraceId()
    await this._simple1()
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

  // #region private methods sub

  @Trace<DecoratorScopeComponentController['_simple1a']>({
    scope: () => scope1,
  })
  private async _simple1a(): Promise<string> {
    return 'ok'
  }

}

