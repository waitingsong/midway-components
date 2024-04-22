/* eslint-disable import/max-dependencies */
import assert from 'node:assert'

import { CachingFactory } from '@midwayjs/cache-manager'
import {
  App,
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
  IMidwayContainer,
  MConfig,
  deleteRouter,
} from '@mwcp/share'

import * as DefaultConfig from './config/config.default.js'
import * as LocalConfig from './config/config.local.js'
import * as UnittestConfig from './config/config.unittest.js'
import { useComponents } from './imports.js'
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
  @MConfig(ConfigKey.config) protected readonly cacheConfig: CacheManagerConfig
  // /** original config */
  // @MConfig() protected readonly cacheManager: CacheManager

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

  @TraceInit({ namespace: ConfigKey.componentName })
  async onReady(container: IMidwayContainer): Promise<void> {
    void container
    assert(
      this.app,
      'this.app undefined. If start for development, please set env first like `export MIDWAY_SERVER_ENV=local`',
    )

    this.logger.info(`[${ConfigKey.componentName}] onReady`)
  }

}

