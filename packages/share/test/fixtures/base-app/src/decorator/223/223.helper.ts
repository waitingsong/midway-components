import assert from 'node:assert'

import { Singleton } from '@midwayjs/core'
import type { MethodTypeUnknown } from '@waiting/shared-types'

import { type CacheableArgs, decoratorExecutorAsync, decoratorExecutorSync, ttl10, ttl20, ttl40 } from '../../helper.js'
import { DecoratorExecutorParamBase, DecoratorHandlerBase, customDecoratorFactory } from '../../types/index.js'


export const METHOD_KEY_Cacheable_mix = 'decorator:method_key_cacheable_mix'

@Singleton()
export class DecoratorHandlerMix extends DecoratorHandlerBase {
  override genExecutorParam(options: DecoratorExecutorParamBase<CacheableArgs>) {
    assert(this.app)
    assert(this.app.getApplicationContext())
    assert(this.app === options.webApp)
    assert(options.webContext)

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

export function CacheableMix(options?: Partial<CacheableArgs>) {
  return customDecoratorFactory({
    decoratorArgs: options,
    decoratorKey: METHOD_KEY_Cacheable_mix,
    decoratorHandlerClass: DecoratorHandlerMix,
    beforeRegister: (target, propertyName, descriptor, opts) => {
      assertBeforeAfter(target, propertyName, descriptor, opts)
    },
    afterRegister: (target, propertyName, descriptor, opts) => {
      assertBeforeAfter(target, propertyName, descriptor, opts)
    },
  })
}


function assertBeforeAfter(target: object | MethodTypeUnknown, propertyName: unknown, descriptor: unknown, opts: unknown): void {
  if (typeof propertyName === 'undefined') { // class decorator
    assert(target && typeof target === 'function', import.meta.url + ` ${target.constructor.name} must be a class`)
    assert(typeof descriptor === 'undefined', import.meta.url)
    assert(opts && typeof opts === 'object', import.meta.url)
  }
  else if (typeof propertyName === 'string') { // method decorator
    assert(target && typeof target === 'object', import.meta.url + ` ${target.constructor.name} ${propertyName} must be class method (object)`)
    assert(propertyName && typeof propertyName === 'string', import.meta.url)
    assert(descriptor && typeof descriptor === 'object', import.meta.url)
    assert(opts && typeof opts === 'object', import.meta.url)
  }
  else {
    throw new TypeError(`4 invalid propertyName` + import.meta.url)
  }
}

