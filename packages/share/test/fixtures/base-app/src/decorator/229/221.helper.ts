import assert from 'node:assert'

import { Init, Singleton } from '@midwayjs/core'
import type { MethodTypeUnknown } from '@waiting/shared-types'

import { decoratorExecutorAsync, decoratorExecutorSync, type CacheableArgs } from '../../helper.js'
import {
  DecoratorHandlerBase,
  DecoratorExecutorParamBase,
  customDecoratorFactory,
} from '../../types/index.js'



export const METHOD_KEY_Cacheable2 = 'decorator:method_key_cacheable2_test'
export const METHOD_KEY_Cacheable_number = 'decorator:method_key_cacheable_number_test'


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

export function Cacheable2(options?: Partial<CacheableArgs>) {
  return customDecoratorFactory({
    decoratorArgs: options,
    decoratorKey: METHOD_KEY_Cacheable2,
    decoratorHandlerClass: DecoratorHandler,
    beforeRegister: (target, propertyName, descriptor, opts) => {
      assertBeforeAfter(target, propertyName, descriptor, opts)
    },
    afterRegister: (target, propertyName, descriptor, opts) => {
      assertBeforeAfter(target, propertyName, descriptor, opts)
    },
  })
}

export function CacheableNumber(ttl?: CacheableArgs['ttl']) {
  return customDecoratorFactory({
    decoratorArgs: { ttl },
    decoratorKey: METHOD_KEY_Cacheable_number,
    decoratorHandlerClass: DecoratorHandlerNumber,
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

