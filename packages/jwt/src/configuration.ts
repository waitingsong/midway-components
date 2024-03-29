/* eslint-disable import/max-dependencies */
import assert from 'node:assert'

import {
  App,
  Config as _Config,
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
// import { TraceInit } from '@mwcp/otel'
import {
  Application,
  IMidwayContainer,
  registerMiddleware,
  deleteRouter,
} from '@mwcp/share'

import * as DefaultConfig from './config/config.default.js'
import * as LocalConfig from './config/config.local.js'
import * as UnittestConfig from './config/config.unittest.js'
import { useComponents } from './imports.js'
import {
  Config as Conf,
  ConfigKey,
  MiddlewareConfig,
} from './lib/types.js'
import { JwtMiddleware } from './middleware/index.middleware.js'


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

  @_Config(ConfigKey.config) protected readonly config: Conf
  @_Config(ConfigKey.middlewareConfig) protected readonly mwConfig: MiddlewareConfig

  @Inject() protected readonly environmentService: MidwayEnvironmentService
  @Inject() protected readonly informationService: MidwayInformationService
  @Inject() protected readonly decoratorService: MidwayDecoratorService
  @Inject() protected readonly webRouterService: MidwayWebRouterService

  @Logger() protected readonly logger: ILogger

  async onConfigLoad(): Promise<void> {
    if (! this.config.enableDefaultRoute) {
      await deleteRouter(`/_${ConfigKey.namespace}`, this.webRouterService)
    }
    else if (this.mwConfig.ignore) {
      this.mwConfig.ignore.push(new RegExp(`/_${ConfigKey.namespace}/.+`, 'u'))
    }
  }

  // @TraceInit(`INIT ${ConfigKey.componentName}.onReady`)
  async onReady(container: IMidwayContainer): Promise<void> {
    void container
    assert(
      this.app,
      'this.app undefined. If start for development, please set env first like `export MIDWAY_SERVER_ENV=local`',
    )

    const { enableMiddleware } = this.mwConfig
    if (enableMiddleware || typeof enableMiddleware === 'number') {
      registerMiddleware(this.app, JwtMiddleware)
    }
  }

}

