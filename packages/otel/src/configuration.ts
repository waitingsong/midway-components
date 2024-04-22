import assert from 'node:assert'

import {
  App,
  Config,
  Configuration,
  ILifeCycle,
  Inject,
  Logger,
  MidwayEnvironmentService,
  MidwayInformationService,
  MidwayWebRouterService,
} from '@midwayjs/core'
import { ILogger } from '@midwayjs/logger'
import {
  Application,
  IMidwayContainer,
  deleteRouter,
  registerMiddleware,
} from '@mwcp/share'
import { sleep } from '@waiting/shared-core'

import * as DefaultConfig from './config/config.default.js'
import * as LocalConfig from './config/config.local.js'
import * as UnittestConfig from './config/config.unittest.js'
import { useComponents } from './imports.js'
import { OtelComponent } from './lib/component.js'
import { TraceInit } from './lib/index.js'
import {
  Config as Conf,
  ConfigKey,
  MiddlewareConfig,
} from './lib/types.js'
import {
  TraceMiddlewareInner,
  TraceMiddleware,
} from './middleware/index.middleware.js'


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

  @Config(ConfigKey.config) protected readonly config: Conf
  @Config(ConfigKey.middlewareConfig) protected readonly mwConfig: MiddlewareConfig

  @Inject() protected readonly environmentService: MidwayEnvironmentService
  @Inject() protected readonly informationService: MidwayInformationService
  @Inject() protected readonly webRouterService: MidwayWebRouterService

  @Inject() otel: OtelComponent

  @Logger() logger: ILogger

  async onConfigLoad(): Promise<void> {
    if (! this.config.enableDefaultRoute) {
      await deleteRouter(`/_${ConfigKey.namespace}`, this.webRouterService)
    }
    else if (this.mwConfig.ignore) {
      this.mwConfig.ignore.push(new RegExp(`/_${ConfigKey.namespace}/.+`, 'u'))
    }
  }

  @TraceInit({ namespace: ConfigKey.componentName })
  async onReady(container: IMidwayContainer): Promise<void> {
    void container
    assert(
      this.app,
      'this.app undefined. If start for development, please set env first like `export MIDWAY_SERVER_ENV=local`',
    )

    // const otel = await this.app.getApplicationContext().getAsync(OtelComponent, [ { name, version } ])
    // assert(otel, 'otel must be set')

    if (this.config.enable && this.mwConfig.enableMiddleware) {
      registerMiddleware(this.app, TraceMiddlewareInner, 'last')
    }
  }

  @TraceInit({ namespace: ConfigKey.componentName })
  async onServerReady(container: IMidwayContainer): Promise<void> {
    void container
    if (this.config.enable && this.mwConfig.enableMiddleware) {
      registerMiddleware(this.app, TraceMiddleware, 'first')
    }

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    void setTimeout(async () => {
      const mwNames = this.app.getMiddleware().getNames()
      this.otel.addAppInitEvent({
        event: `${ConfigKey.componentName}.onServerReady.end`,
        mwNames: JSON.stringify(mwNames),
      })
      this.otel.endAppInitEvent()
    }, 0)
  }

  async onStop(container: IMidwayContainer): Promise<void> {
    this.logger.info('[otel] onStop()')
    const otel = await container.getAsync(OtelComponent)
    await sleep(100)
    await otel.shutdown()
  }

}

