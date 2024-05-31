import { Singleton } from '@midwayjs/core'
import { DecoratorExecutorParamBase } from '@mwcp/share'

import { DecoratorHandlerCacheBase } from '../decorator.handler.types.js'
import { genDecoratorExecutorOptions } from '../helper.js'
import { CacheableArgs, DecoratorExecutorOptions, GenDecoratorExecutorOptionsExt } from '../types.js'

import { before, decoratorExecutor } from './cacheput.helper.js'


/**
 * CachePut decorator handler
 * @description not support sync method
 */
@Singleton()
export class DecoratorHandlerCachePut extends DecoratorHandlerCacheBase {
  override genExecutorParam(options: DecoratorExecutorParamBase): DecoratorExecutorOptions {
    const optsExt: GenDecoratorExecutorOptionsExt = {
      config: this.cacheConfig,
      cachingFactory: this.cachingFactory,
      op: 'cacheput',
    }
    const ret = genDecoratorExecutorOptions(options, optsExt)
    return ret
  }

  override async before(options: DecoratorExecutorOptions<CacheableArgs>) {
    await before(options)
  }

  override around(options: DecoratorExecutorOptions<CacheableArgs>) {
    return decoratorExecutor(options)
  }

}

