import assert from 'node:assert'

import { Init, Provide, Singleton } from '@midwayjs/core'

import {
  DecoratorExecutorParamBase,
  DecoratorHandlerBase,
} from '../../../../src/index.js'

import { CacheService, data } from './30.cacheable-async-only.service.js'
import {
  CacheableArgs,
  decoratorExecutorAsync,
  decoratorExecutorSync,
  ttl10,
  ttl20,
  ttl40,
} from './helper.js'


@Singleton()
export class DecoratorHandler extends DecoratorHandlerBase {

  debug = false

  @Init()
  async init() {
    void 0
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

  override async executorAsync(options: DecoratorExecutorParamBase<CacheableArgs>) {
    assert(this.debug === false)
    return decoratorExecutorAsync(options)
  }

  override executorSync(options: DecoratorExecutorParamBase<CacheableArgs>) {
    return decoratorExecutorSync(options)
  }
}

interface DecoratorExecutorParam extends DecoratorExecutorParamBase<CacheableArgs> {
  cacheService: CacheService
}

@Singleton()
export class DecoratorHandlerAsyncOnly2 extends DecoratorHandlerBase {
  @Init()
  async init() {
    void 0
  }

  override async genExecutorParamAsync(options: DecoratorExecutorParam): Promise<DecoratorExecutorParam> {
    assert(options.webContext)
    assert(! options.cacheService)
    const cacheService = await options.webContext.requestContext.getAsync(CacheService)
    assert(cacheService, 'cacheService is required 1')
    const opts = {
      ...options,
      cacheService,
    }
    return opts
  }

  override genExecutorParam(options: DecoratorExecutorParam) {
    if (options.methodIsAsyncFunction) {
      assert(options.cacheService, 'cacheService is required 2')
    }
    else {
      assert(! options.cacheService, 'cacheService is undefined due to method is sync function')
    }

    return options
  }

  override async executorAsync(options: DecoratorExecutorParam) {
    const { cacheService } = options
    assert(cacheService, 'cacheService is required 3')
    assert(await cacheService.foo() === data.foo)
    assert(cacheService.bar() === data.bar)
    return decoratorExecutorAsync(options)
  }
}

@Singleton()
export class DecoratorHandlerSyncOnly2 extends DecoratorHandlerBase {
  override genExecutorParam(options: DecoratorExecutorParamBase<CacheableArgs>) {
    return options
  }

  override executorSync(options: DecoratorExecutorParamBase<CacheableArgs>) {
    return decoratorExecutorSync(options)
  }
}

@Singleton()
export class DecoratorHandlerNumber extends DecoratorHandlerBase {
  override async executorAsync(options: DecoratorExecutorParamBase<CacheableArgs>) {
    const [input] = options.methodArgs
    assert(typeof input === 'number')

    const { mergedDecoratorParam } = options
    const { ttl } = mergedDecoratorParam ?? {}
    assert(typeof ttl === 'number')

    return input + ttl
  }

  override executorSync(options: DecoratorExecutorParamBase<CacheableArgs>) {
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

  @Init()
  async init() {
    void 0
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

  override async executorAsync(options: DecoratorExecutorParamBase<CacheableArgs>) {
    return decoratorExecutorAsync(options)
  }

  override executorSync(options: DecoratorExecutorParamBase<CacheableArgs>) {
    return decoratorExecutorSync(options)
  }
}


class DecoratorHandler2 extends DecoratorHandlerBase {
  override async executorAsync(options: DecoratorExecutorParamBase<CacheableArgs>) {
    return decoratorExecutorAsync(options)
  }

  override executorSync(options: DecoratorExecutorParamBase<CacheableArgs>) {
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

  override async executorAsync(options: DecoratorExecutorParamBase<CacheableArgs>) {
    const { argsFromClassDecorator, argsFromMethodDecorator, mergedDecoratorParam } = options
    void argsFromClassDecorator
    void argsFromMethodDecorator
    // assert(argsFromClassDecorator)
    // assert(argsFromMethodDecorator)
    // assert(mergedDecoratorParam)
    assert(mergedDecoratorParam)
    switch (options.methodName) {
      case 'simple':
        assert(mergedDecoratorParam.ttl === ttl20, JSON.stringify(mergedDecoratorParam))
        break

      case '_simpleAsync':
        assert(mergedDecoratorParam.ttl === ttl40, JSON.stringify(mergedDecoratorParam))
        break

      default:
        throw new Error('unknown methodName')
    }
    return decoratorExecutorAsync(options)
  }

  override executorSync(options: DecoratorExecutorParamBase<CacheableArgs>) {
    const { argsFromClassDecorator, argsFromMethodDecorator, mergedDecoratorParam } = options
    void argsFromClassDecorator
    void argsFromMethodDecorator
    // assert(argsFromClassDecorator)
    // assert(argsFromMethodDecorator)
    // assert(mergedDecoratorParam)
    assert(mergedDecoratorParam)
    switch (options.methodName) {
      case '_simpleSync':
        assert(mergedDecoratorParam.ttl === ttl10, JSON.stringify(mergedDecoratorParam))
        break

      default:
        throw new Error('unknown methodName')
    }
    return decoratorExecutorSync(options)
  }

}


@Singleton()
export class DecoratorHandlerMulti1 extends DecoratorHandlerBase {
  @Init()
  async init() {
    void 0
  }

  id = 1

  override async executorAsync(options: DecoratorExecutorParamBase<CacheableArgs>) {
    return decoratorExecutorAsync(options)
  }

  override executorSync(options: DecoratorExecutorParamBase<CacheableArgs>) {
    return decoratorExecutorSync(options)
  }
}

@Singleton()
export class DecoratorHandlerMulti2 extends DecoratorHandlerBase {
  @Init()
  async init() {
    void 0
  }

  id = 2

  override async executorAsync(options: DecoratorExecutorParamBase<CacheableArgs>) {
    return decoratorExecutorAsync(options)
  }

  override executorSync(options: DecoratorExecutorParamBase<CacheableArgs>) {
    return decoratorExecutorSync(options)
  }
}
