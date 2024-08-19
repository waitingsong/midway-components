import assert from 'node:assert'

import { Singleton } from '@midwayjs/core'

import { decoratorExecutorAsync, decoratorExecutorSync, type CacheableArgs } from '../../helper.js'
import { customDecoratorFactory, DecoratorExecutorParamBase, DecoratorHandlerBase } from '../../types/index.js'


export const METHOD_KEY_Multi_Decorate = 'decorator:method_key_multi_decorate'

@Singleton()
export class DecoratorHandlerMultiDecorate extends DecoratorHandlerBase {
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


export function MultiDecorate(ttl?: CacheableArgs['ttl']) {
  return customDecoratorFactory({
    decoratorArgs: { ttl },
    decoratorKey: METHOD_KEY_Multi_Decorate,
    decoratorHandlerClass: DecoratorHandlerMultiDecorate,
  })
}


