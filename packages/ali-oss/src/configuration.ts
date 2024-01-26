/* eslint-disable import/max-dependencies */
import {
  Config,
  Configuration,
  ILifeCycle,
  Inject,
  MidwayWebRouterService,
} from '@midwayjs/core'
import { deleteRouter } from '@mwcp/share'

import * as DefaultConfig from './config/config.default.js'
// import * as LocalConfig from './config/config.local.js'
import * as UnittestConfig from './config/config.unittest.js'
import { useComponents } from './imports.js'
import {
  Config as Conf,
  ConfigKey,
} from './lib/types.js'


@Configuration({
  namespace: ConfigKey.namespace,
  importConfigs: [
    {
      default: DefaultConfig,
      // local: LocalConfig,
      unittest: UnittestConfig,
    },
  ],
  imports: useComponents,
})
export class AutoConfiguration implements ILifeCycle {
  @Inject() protected readonly webRouterService: MidwayWebRouterService

  @Config(ConfigKey.config) protected readonly config: Conf

  async onReady(): Promise<void> {
    if (! this.config.enableDefaultRoute) {
      await deleteRouter(`/_${ConfigKey.namespace}`, this.webRouterService)
    }
  }
}


