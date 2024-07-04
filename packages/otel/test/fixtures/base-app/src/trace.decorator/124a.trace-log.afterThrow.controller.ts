import assert from 'node:assert'

import {
  Controller,
  Get,
  Inject,
} from '@midwayjs/core'
import { MConfig } from '@mwcp/share'
import { sleep } from '@waiting/shared-core'

import { apiBase, apiMethod } from '../types/api-test.js'
import { DecoratorTraceData, Trace, TraceLog, TraceService } from '../types/index.js'
import { Attributes, Config, ConfigKey } from '../types/lib-types.js'


@Controller(apiBase.trace_log)
export class TraceLogComponentController {

  @MConfig(ConfigKey.config) readonly config: Config

  @Inject() readonly traceSvc: TraceService

  @Trace()
  @Get(`/${apiMethod.after_throw}`)
  async error(): Promise<string> {
    const traceId = this.traceSvc.getTraceId()
    try {
      await this._simple1('foo')
    }
    catch (ex) {
      assert(ex instanceof Error)
      assert(ex.message === 'foo-error')

      await sleep(1) // make sure the order of the two methods

      try {
        this._simple2('bar')
      }
      catch (ex2) {
        assert(ex2 instanceof Error)
        assert(ex2.message === 'bar-error')

        return traceId
      }
    }

    assert(false, 'Should not run here')
  }

  // #region private methods

  @TraceLog<TraceLogComponentController['_simple1']>({
    afterThrow: async ([input], error, { instanceName, methodName }) => {
      void error
      const attrs: Attributes = {
        args0: input,
      }
      const events: Attributes = {
        ...attrs,
        instanceName,
        methodName,
      }
      return { events }
    },
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
    if (input === 'foo') {
      throw new Error('foo-error')
    }
    return input
  }

  @TraceLog<TraceLogComponentController['_simple2']>({
    afterThrow: ([input], error, { instanceName, methodName }) => {
      void error
      const attrs: Attributes = {
        args0: input,
      }
      const events: Attributes = {
        ...attrs,
        instanceName,
        methodName,
      }
      return { events }
    },
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
    if (input === 'bar') {
      throw new Error('bar-error')
    }
    return input
  }
}

