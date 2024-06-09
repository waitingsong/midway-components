import assert from 'node:assert'

import { Init, Provide, Singleton } from '@midwayjs/core'

import {
  CacheableArgs,
  decoratorExecutorAsync,
  decoratorExecutorSync,
  ttl10,
  ttl20,
  ttl40,
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

@Singleton()
export class DecoratorHandlerNumber extends DecoratorHandlerBase {
  override around(options: DecoratorExecutorParamBase<CacheableArgs>): unknown {
    const [input] = options.methodArgs
    assert(typeof input === 'number')

    const { mergedDecoratorParam } = options
    const { ttl } = mergedDecoratorParam ?? {}
    assert(typeof ttl === 'number')

    return input + ttl
  }
}

@Provide()
export class DecoratorHandlerRequest extends DecoratorHandlerBase {
  // @Inject() context: Context <-- will cause error: context in class DecoratorHandlerRequest is not valid in current context

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
    // Do NOT use isAsyncFunction(options.method), result may not correct
    if (options.methodIsAsyncFunction) {
      return decoratorExecutorAsync(options)
    }
    return decoratorExecutorSync(options)
  }
}


class DecoratorHandler2 extends DecoratorHandlerBase {
  override around(options: DecoratorExecutorParamBase<CacheableArgs>) {
    // Do NOT use isAsyncFunction(options.method), result may not correct
    if (options.methodIsAsyncFunction) {
      return decoratorExecutorAsync(options)
    }
    return decoratorExecutorSync(options)
  }
}
@Singleton()
export class DecoratorHandlerRequestExtendsSingleton extends DecoratorHandler2 {
  override genExecutorParam(options: DecoratorExecutorParamBase<CacheableArgs>) {
    assert(this.app)
    assert(this.app.getApplicationContext())
    return options
  }
}


@Singleton()
export class DecoratorHandlerMix extends DecoratorHandlerBase {
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
    const { argsFromClassDecorator, argsFromMethodDecorator, mergedDecoratorParam } = options
    void argsFromClassDecorator
    void argsFromMethodDecorator
    assert(mergedDecoratorParam)
    switch (options.methodName) {
      case 'simple':
        assert(mergedDecoratorParam.ttl === ttl20, JSON.stringify(mergedDecoratorParam))
        break

      case '_simpleAsync':
        assert(mergedDecoratorParam.ttl === ttl40, JSON.stringify(mergedDecoratorParam))
        break

      case '_simpleSync':
        assert(mergedDecoratorParam.ttl === ttl10, JSON.stringify(mergedDecoratorParam))
        break

      default:
        throw new Error('unknown methodName')
    }

    // Do NOT use isAsyncFunction(options.method), result not correct
    if (options.methodIsAsyncFunction) {
      return decoratorExecutorAsync(options)
    }
    return decoratorExecutorSync(options)
  }

}


@Singleton()
export class DecoratorHandlerMulti1 extends DecoratorHandlerBase {
  readonly id = 1

  override around(options: DecoratorExecutorParamBase<CacheableArgs>) {
    assert(this.id === 1)

    // Do NOT use isAsyncFunction(options.method), result not correct
    if (options.methodIsAsyncFunction) {
      return decoratorExecutorAsync(options)
    }
    return decoratorExecutorSync(options)
  }
}

@Singleton()
export class DecoratorHandlerMulti2 extends DecoratorHandlerBase {
  readonly id = 2

  override around(options: DecoratorExecutorParamBase<CacheableArgs>) {
    assert(this.id === 2)

    // Do NOT use isAsyncFunction(options.method), result not correct
    if (options.methodIsAsyncFunction) {
      return decoratorExecutorAsync(options)
    }
    return decoratorExecutorSync(options)
  }
}

