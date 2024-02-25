/* eslint-disable import/max-dependencies */
import assert from 'node:assert'

import { CachingFactory } from '@midwayjs/cache-manager'
import {
  App,
  Config,
  Configuration,
  ILifeCycle,
  ILogger,
  Inject,
  Logger,
  MidwayDecoratorService,
  MidwayEnvironmentService,
  MidwayInformationService,
  MidwayWebRouterService,
} from '@midwayjs/core'
import { TraceInit } from '@mwcp/otel'
import {
  Application,
  AroundFactoryParamBase,
  IMidwayContainer,
  RegisterDecoratorHandlerParam,
  deleteRouter,
  registerDecoratorHandler,
} from '@mwcp/share'

import * as DefaultConfig from './config/config.default.js'
import * as LocalConfig from './config/config.local.js'
import * as UnittestConfig from './config/config.unittest.js'
import { useComponents } from './imports.js'
import { decoratorExecutor } from './lib/cacheable/helper.cacheable.js'
import { decoratorExecutor as decoratorExecutorEvict } from './lib/cacheevict/helper.cacheevict.js'
import { decoratorExecutor as decoratorExecutorPut } from './lib/cacheput/helper.cacheput.js'
import { METHOD_KEY_CacheEvict, METHOD_KEY_CachePut, METHOD_KEY_Cacheable } from './lib/config.js'
import { genDecoratorExecutorOptions } from './lib/helper.js'
import { CacheManagerConfig } from './lib/index.js'
import { ConfigKey } from './lib/types.js'


@Configuration({
  namespace: ConfigKey.namespace,
  importConfigs: [
    {
      default: DefaultConfig,
      local: LocalConfig,
      unittest: UnittestConfig,
    },
  ],
  imports: useComponents,
})
export class AutoConfiguration implements ILifeCycle {

  @App() readonly app: Application

  /** component config */
  @Config(ConfigKey.config) protected readonly cacheConfig: CacheManagerConfig
  // /** original config */
  // @Config() protected readonly cacheManager: CacheManager

  @Inject() protected readonly environmentService: MidwayEnvironmentService
  @Inject() protected readonly informationService: MidwayInformationService
  @Inject() protected readonly webRouterService: MidwayWebRouterService

  @Logger() protected readonly logger: ILogger

  @Inject() decoratorService: MidwayDecoratorService
  @Inject() cachingFactory: CachingFactory

  async onConfigLoad(): Promise<void> {
    assert(this.cacheConfig, 'cache config is required')
    // updateCacheConfig(this.cacheManager, this.cacheConfig)

    if (! this.cacheConfig.enableDefaultRoute) {
      await deleteRouter(`/_${ConfigKey.namespace}`, this.webRouterService)
    }
    // else if (this.mwConfig.ignore) {
    //   this.mwConfig.ignore.push(new RegExp(`/_${ConfigKey.namespace}/.+`, 'u'))
    // }

  }

  @TraceInit(`INIT ${ConfigKey.componentName}.onReady`)
  async onReady(container: IMidwayContainer): Promise<void> {
    void container
    assert(
      this.app,
      'this.app undefined. If start for development, please set env first like `export MIDWAY_SERVER_ENV=local`',
    )

    // const config = this.app.getConfig('cache') as CacheConfig
    // assert.deepEqual(config, this.cacheConfig)

    const aroundFactoryOptions: AroundFactoryParamBase = {
      webApp: this.app,
      cachingFactory: this.cachingFactory,
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

    this.logger.info(`[${ConfigKey.componentName}] onReady`)
  }

}

