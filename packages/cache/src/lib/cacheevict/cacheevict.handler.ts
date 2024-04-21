import { CachingFactory } from '@midwayjs/cache-manager'
import { Inject, Singleton } from '@midwayjs/core'
import { MConfig, DecoratorExecutorParamBase, DecoratorHandlerBase } from '@mwcp/share'

import { GenDecoratorExecutorOptionsExt, genDecoratorExecutorOptions } from '../helper.js'
import { Config, CacheEvictArgs, ConfigKey, DecoratorExecutorOptions } from '../types.js'

import { decoratorExecutor } from './cacheevict.helper.js'


/**
 * Cacheable decorator handler
 * @description Not support sync method
 */
@Singleton()
export class DecoratorHandlerCacheEvict extends DecoratorHandlerBase {
  /** component config */
  @MConfig(ConfigKey.config) protected readonly cacheConfig: Config

  @Inject() cachingFactory: CachingFactory

  override async genExecutorParamAsync(options: DecoratorExecutorParamBase): Promise<DecoratorExecutorOptions> {
    const optsExt: GenDecoratorExecutorOptionsExt = {
      config: this.cacheConfig,
      cachingFactory: this.cachingFactory,
      op: 'cacheevict',
    }
    const ret = genDecoratorExecutorOptions(options, optsExt)
    return ret
  }

  override async executorAsync(options: DecoratorExecutorOptions<CacheEvictArgs>) {
    return decoratorExecutor(options)
  }

}

