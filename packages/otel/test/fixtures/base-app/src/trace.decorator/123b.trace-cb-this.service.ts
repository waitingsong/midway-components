/* eslint-disable @typescript-eslint/await-thenable */
import assert from 'node:assert'

import { Singleton } from '@midwayjs/core'
import { Context } from '@mwcp/share'

import { Trace } from '../types/index.js'


@Singleton()
export class TraceSingletonThisService {
  foo = 1

  @Trace<TraceSingletonThisService['home']>({
    before([options], decoratorContext) {
      assert(this instanceof TraceSingletonThisService)
      assert(this === decoratorContext.instance)
      assert(this.foo === 1)
      this.foo += 1

      assert(options)
      assert(options.webContext === decoratorContext.webContext)
      assert(options.input === 'hello')
      options.input += '-modified'

      return void 0
    },
    after([options], res, decoratorContext) {
      assert(this instanceof TraceSingletonThisService)
      assert(this === decoratorContext.instance)
      assert(this.foo === 2)
      this.foo = 1

      assert(options)
      assert(options.webContext === decoratorContext.webContext)
      assert(options.input.endsWith('-modified'))
      assert(options.input === res)

      return void 0
    },
  })
  async home(this: TraceSingletonThisService, options: InputOptions): Promise<string> {
    assert(typeof options.webContext?.getApp === 'function')
    assert(options.input.endsWith('-modified'), options.input)
    assert(options.webContext.host)
    const ret = await options.input
    return ret
  }

  @Trace<TraceSingletonThisService['hello2']>({
    before([options, ctx], decoratorContext) {
      assert(this instanceof TraceSingletonThisService)
      assert(this === decoratorContext.instance)
      assert(this.foo === 1)

      assert(options)
      assert(! options.webContext)
      assert(options.input === 'hello2')
      options.input += '-modified'
      assert(! options.webContext)
      assert(ctx === decoratorContext.webContext)

      return void 0
    },
    after([options, ctx], res, decoratorContext) {
      assert(this instanceof TraceSingletonThisService)
      assert(this === decoratorContext.instance)
      assert(this.foo === 1)

      assert(decoratorContext.webContext)
      assert(typeof decoratorContext.webContext.getApp === 'function')
      assert(decoratorContext.traceService)

      assert(options)
      assert(! options.webContext)
      assert(options.input.endsWith('-modified'))
      assert(options.input === res)
      assert(ctx === decoratorContext.webContext)

      return void 0
    },
  })
  hello2(this: TraceSingletonThisService, options: InputOptions, ctx: Context): string {
    assert(typeof ctx.getApp === 'function')
    assert(options.input.endsWith('-modified'), options.input)
    assert(! options.webContext)

    assert(ctx.host)
    const ret = options.input
    return ret
  }
}

interface InputOptions {
  input: string
  webContext?: Context
}
