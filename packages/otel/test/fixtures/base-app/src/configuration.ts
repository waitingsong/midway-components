import assert from 'node:assert'

import { App, Configuration } from '@midwayjs/core'
import type { Application } from '@mwcp/share'

import * as SRC from './types/index.js'


@Configuration({
  imports: [SRC],
})
export class AutoConfiguration {

  @App() readonly app: Application

  // test afterThrow() manually
  // @SRC.TraceInit({
  //   spanName: 'INIT TEST.onConfigLoad',
  // })
  // async onConfigLoad(): Promise<void> {
  //   throw new Error('TraceInit test afterThrow() manually')
  // }

  @SRC.TraceInit({
    spanName: 'INIT TEST.onConfigLoad',
  })
  async onConfigLoad(): Promise<void> {
    void 0
  }

  @SRC.TraceInit({
    spanName: 'INIT TEST.onReady',
    before: async (args, decoratorContext) => {
      assert(decoratorContext.webApp)
      assert(args.length >= 2)

      const attrs = { testInitBefore: 'testInitBefore' }
      const events = { ...attrs }
      const rootAttrs = { rootInitAttrsBefore: 'rootInitAttrsBefore' }
      const rootEvents = { ...rootAttrs }

      return { attrs, events, rootAttrs, rootEvents }
    },
    after: (args, res, decoratorContext) => {
      assert(decoratorContext.webApp)
      assert(args.length >= 2)
      assert(res === 123n)

      const attrs = { testInitAfter: 'testInitAfter' }
      const events = { ...attrs }
      const rootAttrs = { rootInitAttrsAfter: 'rootInitAttrsAfter' }
      const rootEvents = { ...rootAttrs }

      const { traceService, traceSpan } = decoratorContext
      if (traceSpan) {
        traceService?.otel.addSpanEventWithError(traceSpan, new Error('testInitAfter'))
      }

      return { attrs, events, rootAttrs, rootEvents }
    },
  })
  async onReady(): Promise<bigint> {
    // const foo = this.app.getConfig() as unknown
    // void foo
    return 123n
  }

  @SRC.TraceInit({
    spanName: 'INIT TEST.onServerReady',
    before: (args, decoratorContext) => {
      assert(decoratorContext.webApp)
      assert(args.length >= 2)
      return void 0
    },
    after: async (args, res, decoratorContext) => {
      assert(decoratorContext.webApp)
      assert(args.length >= 2)
      assert(res === 234n)
      return void 0
    },
  })
  async onServerReady(): Promise<bigint> {
    return 234n
  }


  @SRC.TraceInit({
    spanName: 'INIT TEST.onStop',
  })
  async onStop(): Promise<void> {
    return
  }

}
