import 'tsconfig-paths/register'
import assert from 'node:assert'
import { join } from 'node:path'

import { App, Configuration } from '@midwayjs/decorator'

import { ConfigKey } from './lib/index'

import { Application, IMidwayContainer } from '~/interface'


@Configuration({
  namespace: ConfigKey.namespace,
  importConfigs: [join(__dirname, 'config')],
})
export class AutoConfiguration {

  @App() readonly app: Application

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async onReady(_container: IMidwayContainer): Promise<void> {
    assert(this.app, 'this.app must be set')
  }

}


