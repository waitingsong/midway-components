import 'tsconfig-paths/register'
import assert from 'node:assert'
import { join } from 'node:path'

import { CacheManager } from '@midwayjs/cache'
import {
  App,
  Config, Configuration,
  Inject, ILifeCycle,
  MidwayDecoratorService,
} from '@midwayjs/core'
import type { Application } from '@mwcp/share'

import { useComponents } from './imports'
import { registerMethodHandler } from './lib/cacheable/method-decorator.cacheable'
import { registerMethodHandlerEvict } from './lib/cacheevict/method-decorator.cacheevict'
import { CacheConfig } from './lib/index'

import { ConfigKey } from '~/lib/types'


@Configuration({
  namespace: ConfigKey.namespace,
  importConfigs: [join(__dirname, 'config')],
  imports: useComponents,
})
export class AutoConfiguration implements ILifeCycle {

  @App() readonly app: Application

  @Config(ConfigKey.config) protected readonly cacheConfig: CacheConfig
  @Config() protected readonly cache: CacheConfig

  @Inject() decoratorService: MidwayDecoratorService
  @Inject() cacheManager: CacheManager

  async onConfigLoad(): Promise<void> {
    assert(this.cache, 'cache config is required')
    updateCacheConfig(this.cache, this.cacheConfig)
  }

  async onReady(): Promise<void> {
    const config = this.app.getConfig('cache') as CacheConfig
    assert.deepEqual(config, this.cacheConfig)

    registerMethodHandler(
      this.decoratorService,
      this.cacheConfig,
      this.cacheManager,
    )
    registerMethodHandlerEvict(
      this.decoratorService,
      this.cacheConfig,
      this.cacheManager,
    )
  }

}

function updateCacheConfig(
  config: CacheConfig,
  newConfig: CacheConfig,
): CacheConfig {

  assert(config, 'config is required')
  assert(newConfig, 'newConfig is required')

  if (newConfig.store) {
    config.store = newConfig.store
  }
  Object.assign(config.options, newConfig.options)
  return config
}
