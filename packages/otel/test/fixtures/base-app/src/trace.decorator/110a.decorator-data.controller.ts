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

      return { attrs, events, rootAttrs, rootEvents } as DecoratorTraceData
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

      return { attrs, events, rootAttrs, rootEvents } as DecoratorTraceData
    },
    after: (args, res) => {
      const events = { args0: args[0], res }
      return { events }
    },
  })
  private traceDecoratorDataSync(id: string): string {
    return id + testConfig.testSuffix
  }


}

