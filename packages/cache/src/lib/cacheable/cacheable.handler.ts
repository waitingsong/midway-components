import { Singleton } from '@midwayjs/core'
import { DecoratorExecutorParamBase } from '@mwcp/share'

import { DecoratorHandlerCacheBase } from '../decorator.handler.types.js'
import { genDecoratorExecutorOptions } from '../helper.js'
import { CacheableArgs, DecoratorExecutorOptions, GenDecoratorExecutorOptionsExt } from '../types.js'

import { before, around } from './cacheable.helper.js'

/**
 * Cacheable decorator handler
 * @description Not support sync method
 */
@Singleton()
export class DecoratorHandlerCacheable extends DecoratorHandlerCacheBase {
  override genExecutorParam(options: DecoratorExecutorParamBase): DecoratorExecutorOptions {
    const optsExt: GenDecoratorExecutorOptionsExt = {
      config: this.cacheConfig,
      cachingFactory: this.cachingFactory,
      op: 'cacheable',
    }
    const ret = genDecoratorExecutorOptions(options, optsExt)
    return ret
  }

  override async before(options: DecoratorExecutorOptions<CacheableArgs>) {
    await before(options)
  }

  override around(options: DecoratorExecutorOptions<CacheableArgs>) {
    return around(options)
  }
}

