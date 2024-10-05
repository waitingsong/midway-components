import assert from 'node:assert'

import {
  Controller,
  Get,
  Inject,
  Param,
} from '@midwayjs/core'
import { MConfig } from '@mwcp/share'

import { apiBase, apiMethod } from '../types/api-test.js'
import { Attributes, DecoratorTraceData, Trace, TraceService } from '../types/index.js'
import { Config, ConfigKey } from '../types/lib-types.js'
import { testConfig } from '../types/root.config.js'


@Controller(apiBase.decorator_data)
export class DecoratorDataComponentController {

  @MConfig(ConfigKey.config) readonly config: Config

  @Inject() readonly traceSvc: TraceService

  @Trace()
  @Get(`/${apiMethod.mix_on_async}/:id`)
  async mixOnAsync(@Param('id') id: string): Promise<`${string}:${string}`> {
    const traceId = this.traceSvc.getTraceId()
    await this._mixOnAsync(id)
    return `${traceId}:${id}`
  }

  @Trace()
  @Get(`/${apiMethod.mix_on_sync}/:id`)
  async mixOnSync(@Param('id') id: string): Promise<`${string}:${string}`> {
    const traceId = this.traceSvc.getTraceId()
    this._MixOnSync(id)
    return `${traceId}:${id}`
  }

  // #region private methods


  // mix async and sync decorator's callback on async method
  @Trace<DecoratorDataComponentController['_mixOnAsync']>({
    before: async (args) => {
      const attrs: Attributes = {
        args0: args[0],
        traceDecoratorDataAsync: 'foo',
      }
      const events: Attributes = { ...attrs }
      const rootAttrs: Attributes = { rootAttrs: 'rootAttrs' }
      const rootEvents: Attributes = { ...rootAttrs }

      return { attrs, events, rootAttrs, rootEvents }
    },
    after: (args, res) => {
      const events = { args0: args[0], res }
      return { events }
    },
  })
  private async _mixOnAsync(id: string): Promise<string> {
    return id + testConfig.testSuffix
  }

  // mix async and sync decorator's callback on sync method
  // should throw error according to the decorator's callback before() return Promise
  @Trace<DecoratorDataComponentController['_mixOnAsync']>({
    before: async (args) => {
      const attrs: Attributes = {
        args0: args[0],
        traceDecoratorDataAsync: 'foo',
      }
      const events: Attributes = { ...attrs }
      const rootAttrs: Attributes = { rootAttrs: 'rootAttrs' }
      const rootEvents: Attributes = { ...rootAttrs }

      return { attrs, events, rootAttrs, rootEvents }
    },
  })
  private _MixOnSync(id: string): string {
    return id + testConfig.testSuffix
  }

}

