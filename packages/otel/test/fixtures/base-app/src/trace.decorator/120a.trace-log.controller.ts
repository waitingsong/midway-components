import {
  Controller,
  Get,
  Inject,
} from '@midwayjs/core'
import { MConfig } from '@mwcp/share'
import { sleep } from '@waiting/shared-core'

import { DecoratorTraceData, Trace, TraceLog, TraceService } from '../types/index.js'
import { Attributes, Config, ConfigKey } from '../types/lib-types.js'
import { apiBase, apiMethod } from '../types/api-test.js'


@Controller(apiBase.trace_log)
export class TraceLogComponentController {

  @MConfig(ConfigKey.config) readonly config: Config

  @Inject() readonly traceSvc: TraceService

  @Trace()
  @Get(`/${apiMethod.hello}`)
  async hello(): Promise<string> {
    const traceId = this.traceSvc.getTraceId()
    await this._simple1('foo')
    await sleep(1) // make sure the order of the two methods
    this._simple2('bar')
    return traceId
  }

  // #region private methods

  @TraceLog<TraceLogComponentController['_simple1']>({
    before: async ([input], { instanceName, methodName }) => {
      const attrs: Attributes = {
        args0: input,
      }
      const events: Attributes = {
        ...attrs,
        instanceName,
        methodName,
      }
      const rootAttrs: Attributes = { rootAttrs: 'rootAttrs' }
      const rootEvents: Attributes = { ...rootAttrs }

      return { attrs, events, rootAttrs, rootEvents } as DecoratorTraceData
    },
    after: ([input], res, { instanceName, methodName }) => {
      const attrs: Attributes = {
        args0: input,
        res,
      }
      const events: Attributes = {
        ...attrs,
        instanceName,
        methodName,
      }
      return { events }
    },
  })
  private async _simple1(input: string): Promise<string> {
    return input
  }

  @TraceLog<TraceLogComponentController['_simple2']>({
    before: ([input], { instanceName, methodName }) => {
      const events: Attributes = {
        args0: input,
        instanceName,
        methodName,
      }
      return { events } as DecoratorTraceData
    },
    after: ([input], res, { instanceName, methodName }) => {
      const attrs: Attributes = {
        args0: input,
        res,
      }
      const events: Attributes = {
        ...attrs,
        instanceName,
        methodName,
      }
      return { events }
    },
  })
  private _simple2(input: string): string {
    return input
  }
}

