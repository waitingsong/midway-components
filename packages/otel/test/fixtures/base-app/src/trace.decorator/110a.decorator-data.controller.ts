import assert from 'node:assert'

import {
  Controller,
  Get,
  Init,
  Inject,
  MidwayWebRouterService,
  Param,
} from '@midwayjs/core'
import { MConfig } from '@mwcp/share'

import { Attributes, Trace, TraceService, DecoratorTraceDataResp } from '../../../../../dist/lib/index.js'
import { TraceLogger, TraceAppLogger } from '../../../../../dist/lib/trace.logger.js'
import { Config, ConfigKey } from '../../../../../dist/lib/types.js'
import { apiBase, apiMethod } from '../../../../api-test.js'
import { testConfig } from '../../../../root.config.js'

import { DefaultComponentService } from './trace.service.js'


@Controller(apiBase.decorator_data)
export class DecoratorDataComponentController {

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
  @Get(`/${apiMethod.async}/:id`)
  async traceIdAsync(@Param('id') id: string): Promise<`${string}:${string}`> {
    const traceId = this.traceSvc.getTraceId()
    await this.traceDecoratorDataAsync(id)
    // ensure child span is sent, to keep span order for unit test validation
    // await this.traceSvc.flush()
    return `${traceId}:${id}`
  }

  @Trace()
  @Get(`/${apiMethod.sync}/:id`)
  async traceIdSync(@Param('id') id: string): Promise<`${string}:${string}`> {
    const traceId = this.traceSvc.getTraceId()
    this.traceDecoratorDataSync(id)
    return `${traceId}:${id}`
  }

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

  @Trace<DecoratorDataComponentController['traceDecoratorDataAsync']>({
    before: (args, decoratorContext) => {
      assert(decoratorContext.webApp)
      assert(decoratorContext.instanceName === 'DecoratorDataComponentController')
      assert(decoratorContext.methodName === 'traceDecoratorDataAsync')

      const attrs: Attributes = {
        args0: args[0],
        traceDecoratorDataAsync: 'foo',
      }
      const events: Attributes = { ...attrs }
      const rootAttrs: Attributes = { rootAttrs: 'rootAttrs' }
      const rootEvents: Attributes = { ...rootAttrs }

      return { attrs, events, rootAttrs, rootEvents } as DecoratorTraceDataResp
    },
    after: (args, res, decoratorContext) => {
      assert(decoratorContext.instanceName === 'DecoratorDataComponentController')
      assert(decoratorContext.methodName === 'traceDecoratorDataAsync')

      const events = { args0: args[0], res }
      return { events }
    },
  })
  private async traceDecoratorDataAsync(id: string): Promise<string> {
    return id + testConfig.testSuffix
  }


  @Trace<DecoratorDataComponentController['traceDecoratorDataSync']>({
    before: (args, decoratorContext) => {
      assert(decoratorContext.instanceName === 'DecoratorDataComponentController')
      assert(decoratorContext.methodName === 'traceDecoratorDataSync')

      const attrs: Attributes = {
        args0: args[0],
        traceDecoratorDataAsync: 'foo',
      }
      const events: Attributes = { ...attrs }
      const rootAttrs: Attributes = { rootAttrs: 'rootAttrs' }
      const rootEvents: Attributes = { ...rootAttrs }

      return { attrs, events, rootAttrs, rootEvents } as DecoratorTraceDataResp
    },
    after: (args, res) => {
      const events = { args0: args[0], res }
      return { events }
    },
  })
  private traceDecoratorDataSync(id: string): string {
    return id + testConfig.testSuffix
  }

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

