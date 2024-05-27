import { Singleton } from '@midwayjs/core'
import type { DecoratorExecutorParamBase } from '@mwcp/share'

import { DecoratorHandlerCacheBase } from '../decorator.handler.types.js'
import { genDecoratorExecutorOptions } from '../helper.js'
import { CacheEvictArgs, DecoratorExecutorOptions, GenDecoratorExecutorOptionsExt } from '../types.js'

import { around, before } from './cacheevict.helper.js'


/**
 * CacheEvict decorator handler
 * @description Not support sync method
 */
@Singleton()
export class DecoratorHandlerCacheEvict extends DecoratorHandlerCacheBase {
  override genExecutorParam(options: DecoratorExecutorParamBase): DecoratorExecutorOptions {
    const optsExt: GenDecoratorExecutorOptionsExt = {
      config: this.cacheConfig,
      cachingFactory: this.cachingFactory,
      op: 'cacheevict',
    }
    const ret = genDecoratorExecutorOptions(options, optsExt)
    return ret
  }

  override async before(options: DecoratorExecutorOptions<CacheEvictArgs>) {
    try {
      await before(options)
    }
    catch (error) {
      this.afterThrow(options, error)
    }
  }

  override around(options: DecoratorExecutorOptions<CacheEvictArgs>) {
    return around(options)
  }
}

