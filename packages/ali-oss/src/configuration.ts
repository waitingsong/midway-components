import 'tsconfig-paths/register'
import assert from 'node:assert'
import { join } from 'node:path'

import { ILifeCycle } from '@midwayjs/core'
import { App, Configuration } from '@midwayjs/decorator'
import type { Application, IMidwayContainer } from '@mwcp/share'

import { ConfigKey } from './lib/types'


@Configuration({
  namespace: ConfigKey.namespace,
  importConfigs: [join(__dirname, 'config')],
})
export class AutoConfiguration implements ILifeCycle {

  @App() readonly app: Application

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async onReady(_container: IMidwayContainer): Promise<void> {
    assert(this.app, 'this.app must be set')
  }

}


