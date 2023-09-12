import {
  App,
  Config,
  Configuration,
  MidwayEnvironmentService,
  MidwayInformationService,
  ILifeCycle,
  IMidwayContainer,
  Inject,
} from '@midwayjs/core'

import * as DefulatConfig from './config/config.default.js'
import * as UnittestConfig from './config/config.unittest.js'
import { useComponents } from './imports.js'
import {
  Application,
  Config as Conf,
  ConfigKey,
  MiddlewareConfig,
  MiddlewareOptions,
} from './lib/types.js'
import { JsonRespMiddleware } from './middleware/index.middleware.js'
import { registerMiddleware } from './util/common.js'


@Configuration({
  namespace: ConfigKey.namespace,
  importConfigs: [
    {
      default: DefulatConfig,
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

  @Inject() protected readonly environmentService: MidwayEnvironmentService
  @Inject() protected readonly informationService: MidwayInformationService
  async onReady(container: IMidwayContainer): Promise<void> {
    void container
    if (this.config.enableDefaultRoute && this.mwConfig.ignore) {
      this.mwConfig.ignore.push(new RegExp(`/_${ConfigKey.namespace}/.+`, 'u'))
    }

    const isDevelopmentEnvironment = this.environmentService.isDevelopmentEnvironment()
    if (isDevelopmentEnvironment && this.enableJsonRespMiddlewareConfig === true) {
      registerMiddleware(this.app, JsonRespMiddleware)
    }
  }

}

