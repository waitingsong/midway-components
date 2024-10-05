import assert from 'node:assert'

import { Singleton } from '@midwayjs/core'

import { type CacheableArgs, decoratorExecutorAsync, decoratorExecutorSync } from '../../helper.js'
import { DecoratorExecutorParamBase, DecoratorHandlerBase, customDecoratorFactory } from '../../types/index.js'


export const METHOD_KEY_Multi1 = 'decorator:method_key_multi_1'
export const METHOD_KEY_Multi2 = 'decorator:method_key_multi_2'

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


export function Multi1(ttl?: CacheableArgs['ttl']) {
  return customDecoratorFactory({
    decoratorArgs: { ttl },
    decoratorKey: METHOD_KEY_Multi1,
    decoratorHandlerClass: DecoratorHandlerMulti1,
  })
}


export function Multi2(ttl?: CacheableArgs['ttl']) {
  return customDecoratorFactory({
    decoratorArgs: { ttl },
    decoratorKey: METHOD_KEY_Multi2,
    decoratorHandlerClass: DecoratorHandlerMulti2,
  })
}


