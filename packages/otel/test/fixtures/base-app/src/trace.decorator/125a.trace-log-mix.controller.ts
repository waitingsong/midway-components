import assert from 'node:assert'

import {
  Controller,
  Get,
  Inject,
} from '@midwayjs/core'
import { MConfig } from '@mwcp/share'
import { sleep } from '@waiting/shared-core'

import { apiBase, apiMethod } from '../types/api-test.js'
import { DecoratorTraceData, Trace, TraceLog, TraceService, getSpan } from '../types/index.js'
import { Attributes, Config, ConfigKey } from '../types/lib-types.js'


@Controller(apiBase.trace_log)
export class TraceLogMixController {

  @MConfig(ConfigKey.config) readonly config: Config

  @Inject() readonly traceSvc: TraceService

  @Trace()
  @Get(`/${apiMethod.mix}`)
  async hello(): Promise<string> {
    const activeContext = this.traceSvc.getActiveContext()
    void activeContext
    const traceId = this.traceSvc.getTraceId()
    await this._simple1('foo')
    await sleep(1) // make sure the order of the two methods
    this._simple2('bar')
    return traceId
  }

  // #region private methods

  @TraceLog<TraceLogMixController['_simple1']>({
    async before([input], { instanceName, methodName }) {
      const activeContext = this.traceSvc.getActiveContext()
      assert(activeContext)
      const activeSpan = getSpan(activeContext)
      assert(activeSpan)
      // @ts-expect-error
      assert(activeSpan.name === 'TraceLogMixController/hello')

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
    after([input], res, { instanceName, methodName }) {
      const activeContext = this.traceSvc.getActiveContext()
      assert(activeContext)
      const activeSpan = getSpan(activeContext)
      assert(activeSpan)
      // @ts-expect-error
      assert(activeSpan.name === 'TraceLogMixController/hello')

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
  private async _simple1(this: TraceLogMixController, input: string): Promise<string> {
    const activeContext = this.traceSvc.getActiveContext()
    assert(activeContext)
    const activeSpan = getSpan(activeContext)
    assert(activeSpan)
    // @ts-expect-error
    assert(activeSpan.name === 'TraceLogMixController/hello')
    return input
  }

  @TraceLog<TraceLogMixController['_simple2']>({
    before([input], { instanceName, methodName }) {
      const activeContext = this.traceSvc.getActiveContext()
      assert(activeContext)
      const activeSpan = getSpan(activeContext)
      assert(activeSpan)
      // @ts-expect-error
      assert(activeSpan.name === 'TraceLogMixController/hello')

      const events: Attributes = {
        args0: input,
        instanceName,
        methodName,
      }
      return { events } as DecoratorTraceData
    },
    after([input], res, { instanceName, methodName }) {
      const activeContext = this.traceSvc.getActiveContext()
      assert(activeContext)
      const activeSpan = getSpan(activeContext)
      assert(activeSpan)
      // @ts-expect-error
      assert(activeSpan.name === 'TraceLogMixController/hello')

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
  private _simple2(this: TraceLogMixController, input: string): string {
    const activeContext = this.traceSvc.getActiveContext()
    assert(activeContext)
    const activeSpan = getSpan(activeContext)
    assert(activeSpan)
    // @ts-expect-error
    assert(activeSpan.name === 'TraceLogMixController/hello')

    return input
  }
}

