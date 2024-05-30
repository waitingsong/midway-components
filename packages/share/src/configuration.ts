import {
  App,
  Config,
  Configuration,
  ILifeCycle,
  ILogger,
  IMidwayContainer,
  Inject,
  Logger,
  MidwayDecoratorService,
  MidwayWebRouterService,
} from '@midwayjs/core'

import * as DefaultConfig from './config/config.default.js'
import * as LocalConfig from './config/config.local.js'
import * as UnittestConfig from './config/config.unittest.js'
import { useComponents } from './imports.js'
import { autoRegisterDecoratorHandlers } from './lib/decorator/reg-decorator-handler.js'
import {
  Application,
  Config as Conf,
  ConfigKey,
  MiddlewareConfig,
  MiddlewareOptions,
} from './lib/types.js'
// import { JsonRespMiddleware } from './middleware/index.middleware.js'
import { RouterInfoMiddleware } from './middleware/index.middleware.js'
import { deleteRouter } from './util/common.js'


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
  @Config(ConfigKey.middlewareConfig) protected readonly mwConfig: MiddlewareConfig<MiddlewareOptions>
  @Config(ConfigKey.enableJsonRespMiddlewareConfig) protected readonly enableJsonRespMiddlewareConfig: boolean

  @Inject() protected readonly decoratorService: MidwayDecoratorService
  // @Inject() protected readonly environmentService: MidwayEnvironmentService
  // @Inject() protected readonly informationService: MidwayInformationService
  @Inject() protected readonly webRouterService: MidwayWebRouterService
  @Logger() protected readonly logger: ILogger

  async onConfigLoad(): Promise<void> {
    /* c8 ignore next 3 */
    if (! this.config.enableDefaultRoute) {
      await deleteRouter(`/_${ConfigKey.namespace}`, this.webRouterService)
    }
    // else if (this.mwConfig.ignore) {
    //   this.mwConfig.ignore.push(new RegExp(`/_${ConfigKey.namespace}/.+`, 'u'))
    // }
  }

  async onReady(container: IMidwayContainer): Promise<void> {
    void container
    await autoRegisterDecoratorHandlers(this.app, this.decoratorService, true)

    // @ts-expect-error - types
    this.app.getMiddleware().insertAfter(RouterInfoMiddleware, 'session')

    // const mwNames = this.app.getMiddleware().getNames()
    // const mwReady = mwNames.filter(name => ! name.includes('Controller'))
    // console.info({ mwReady })

    this.logger.info(`[${ConfigKey.componentName}] onReady`)
  }

  async onServerReady(): Promise<void> {
    await autoRegisterDecoratorHandlers(this.app, this.decoratorService, false)
  }

}

