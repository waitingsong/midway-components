/* eslint-disable import/max-dependencies */
import {
  Configuration,
  ILifeCycle,
} from '@midwayjs/core'

import * as DefulatConfig from './config/config.default.js'
// import * as LocalConfig from './config/config.local.js'
import * as UnittestConfig from './config/config.unittest.js'
import { useComponents } from './imports.js'
import { ConfigKey } from './lib/types.js'


@Configuration({
  namespace: ConfigKey.namespace,
  importConfigs: [
    {
      default: DefulatConfig,
      // local: LocalConfig,
      unittest: UnittestConfig,
    },
  ],
  imports: useComponents,
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AutoConfiguration implements ILifeCycle {
}


