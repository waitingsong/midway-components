import 'tsconfig-paths/register'
import assert from 'node:assert'
import { join } from 'node:path'

import { CacheManager } from '@midwayjs/cache'
import {
  App,
  Config as _Config,
  Configuration,
  Inject, ILifeCycle,
  MidwayDecoratorService,
} from '@midwayjs/core'
import { TraceInit } from '@mwcp/otel'
import {
  Application,
  AroundFactoryParamBase,
  IMidwayContainer,
  RegisterDecoratorHandlerParam,
  registerDecoratorHandler,
} from '@mwcp/share'

import { useComponents } from './imports'
import { decoratorExecutor } from './lib/cacheable/helper.cacheable'
import { decoratorExecutor as decoratorExecutorEvict } from './lib/cacheevict/helper.cacheevict'
import { decoratorExecutor as decoratorExecutorPut } from './lib/cacheput/helper.cacheput'
import { genDecoratorExecutorOptions } from './lib/helper'
import { CacheConfig, METHOD_KEY_Cacheable, METHOD_KEY_CacheEvict, METHOD_KEY_CachePut } from './lib/index'

import { ConfigKey } from '~/lib/types'


@Configuration({
  namespace: ConfigKey.namespace,
  importConfigs: [join(__dirname, 'config')],
  imports: useComponents,
})
export class AutoConfiguration implements ILifeCycle {

  @App() readonly app: Application

  /** component config */
  @_Config(ConfigKey.config) protected readonly cacheConfig: CacheConfig
  /** original config */
  @_Config() protected readonly cache: CacheConfig

  @Inject() decoratorService: MidwayDecoratorService
  @Inject() cacheManager: CacheManager

  async onConfigLoad(): Promise<void> {
    assert(this.cache, 'cache config is required')
    updateCacheConfig(this.cache, this.cacheConfig)
  }

  @TraceInit(`INIT ${ConfigKey.componentName}.onReady`)
  async onReady(container: IMidwayContainer): Promise<void> {
    void container

    const config = this.app.getConfig('cache') as CacheConfig
    assert.deepEqual(config, this.cacheConfig)

    const aroundFactoryOptions: AroundFactoryParamBase = {
      webApp: this.app,
      cacheManager: this.cacheManager,
    }
    const base = {
      decoratorService: this.decoratorService,
      fnGenDecoratorExecutorParam: genDecoratorExecutorOptions,
      fnDecoratorExecutorSync: false,
    } as const

    const optsCacheable: RegisterDecoratorHandlerParam = {
      ...base,
      decoratorKey: METHOD_KEY_Cacheable,
      fnDecoratorExecutorAsync: decoratorExecutor,
    }
    registerDecoratorHandler(optsCacheable, aroundFactoryOptions)

    const optsCacheEvict: RegisterDecoratorHandlerParam = {
      ...base,
      decoratorKey: METHOD_KEY_CacheEvict,
      fnDecoratorExecutorAsync: decoratorExecutorEvict,
    }
    registerDecoratorHandler(optsCacheEvict, aroundFactoryOptions)

    const optsCachePut: RegisterDecoratorHandlerParam = {
      ...base,
      decoratorKey: METHOD_KEY_CachePut,
      fnDecoratorExecutorAsync: decoratorExecutorPut,
    }
    registerDecoratorHandler(optsCachePut, aroundFactoryOptions)

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
