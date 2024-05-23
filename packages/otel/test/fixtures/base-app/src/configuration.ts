import assert from 'node:assert'

import { App, Configuration } from '@midwayjs/core'
import type { Application } from '@mwcp/share'

import * as SRC from '../../../../dist/index.js'


@Configuration({
  imports: [SRC],
})
export class AutoConfiguration {

  @App() readonly app: Application

  @SRC.TraceInit({
    spanName: 'INIT TEST.onReady',
    before: async (decoratorContext, args) => {
      assert(decoratorContext.webApp)
      assert(args.length >= 2)

      const attrs = { testInitBefore: 'testInitBefore' }
      const events = { ...attrs }
      const rootAttrs = { rootInitAttrsBefore: 'rootInitAttrsBefore' }
      const rootEvents = { ...rootAttrs }

      return { attrs, events, rootAttrs, rootEvents }
    },
    after: (decoratorContext, args, res) => {
      assert(decoratorContext.webApp)
      assert(args.length >= 2)
      assert(res === 123n)

      const attrs = { testInitAfter: 'testInitAfter' }
      const events = { ...attrs }
      const rootAttrs = { rootInitAttrsAfter: 'rootInitAttrsAfter' }
      const rootEvents = { ...rootAttrs }

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
    before: (decoratorContext, args) => {
      assert(decoratorContext.webApp)
      assert(args.length >= 2)
    },
    after: async (decoratorContext, args, res) => {
      assert(decoratorContext.webApp)
      assert(args.length >= 2)
      assert(res === 234n)
    },
  })
  async onServerReady(): Promise<bigint> {
    return 234n
  }

}
