import { CachingFactory } from '@midwayjs/cache-manager'
import { Inject } from '@midwayjs/core'
import { MConfig, DecoratorHandlerBase, genError } from '@mwcp/share'

import { Config, ConfigKey, DecoratorExecutorOptions } from './types.js'


export class DecoratorHandlerCacheBase extends DecoratorHandlerBase {
  /** component config */
  @MConfig(ConfigKey.config) protected readonly cacheConfig: Config

  @Inject() cachingFactory: CachingFactory

  override afterThrow(options: DecoratorExecutorOptions, errorExt?: unknown): void {
    const { cacheKey } = options
    const op = ConfigKey[options.op as keyof typeof ConfigKey]
    const error = genError({
      error: options.error ?? errorExt,
      throwMessageIfInputUndefined: `[@mwcp/${ConfigKey.namespace}] ${op}() afterThrow error is undefined, cacheKey: "${cacheKey}"`,
      altMessage: `[@mwcp/${ConfigKey.namespace}] ${op}() decorator afterThrow error, cacheKey: "${cacheKey}", cacheKey: "${cacheKey}"`,
    })
    options.error = error

    throw error
  }
}

