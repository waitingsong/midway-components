import assert from 'node:assert'

import { Init, Singleton } from '@midwayjs/core'

import {
  CacheableArgs,
  decoratorExecutorAsync,
  decoratorExecutorSync,
} from './helper.js'
import {
  DecoratorHandlerBase,
  DecoratorExecutorParamBase,
} from './types/index.js'


@Singleton()
export class DecoratorHandler extends DecoratorHandlerBase {
  readonly debug = false

  @Init()
  async init() {
    assert(this.debug === false)
  }

  override genExecutorParam(options: DecoratorExecutorParamBase<CacheableArgs>) {
    assert(this.app)
    assert(this.app.getApplicationContext())
    assert(this.app === options.webApp)
    assert(options.webContext)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const app = options.webContext.getApp() as unknown
    assert(app === this.app)
    return options
  }

  override around(options: DecoratorExecutorParamBase<CacheableArgs>) {
    assert(this.debug === false)
    // Do NOT use isAsyncFunction(options.method), result may not correct
    if (options.methodIsAsyncFunction) {
      return decoratorExecutorAsync(options)
    }
    return decoratorExecutorSync(options)
  }

}


