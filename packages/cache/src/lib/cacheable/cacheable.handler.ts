import { CachingFactory } from '@midwayjs/cache-manager'
import { Inject, Singleton } from '@midwayjs/core'
import { MConfig, DecoratorExecutorParamBase, DecoratorHandlerBase } from '@mwcp/share'

import { genDecoratorExecutorOptions } from '../helper.js'
import { Config, CacheableArgs, ConfigKey, DecoratorExecutorOptions, GenDecoratorExecutorOptionsExt } from '../types.js'

import { decoratorExecutor } from './cacheable.helper.js'

/**
 * Cacheable decorator handler
 * @description Not support sync method
 */
@Singleton()
export class DecoratorHandlerCacheable extends DecoratorHandlerBase {
  /** component config */
  @MConfig(ConfigKey.config) protected readonly cacheConfig: Config

  @Inject() cachingFactory: CachingFactory

  override async genExecutorParamAsync(options: DecoratorExecutorParamBase): Promise<DecoratorExecutorOptions> {
    const optsExt: GenDecoratorExecutorOptionsExt = {
      config: this.cacheConfig,
      cachingFactory: this.cachingFactory,
      op: 'cacheable',
    }
    const ret = genDecoratorExecutorOptions(options, optsExt)
    return ret
  }

  override async executorAsync(options: DecoratorExecutorOptions<CacheableArgs>) {
    return decoratorExecutor(options)
  }

}
