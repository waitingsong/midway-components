import 'tsconfig-paths/register'
import assert from 'node:assert'
import { join } from 'node:path'

import { ILifeCycle } from '@midwayjs/core'
import { App, Config, Configuration } from '@midwayjs/decorator'
import type { Application, IMidwayContainer } from '@mwcp/share'

import { TracerComponent } from './lib/component'
import {
  Config as Conf,
  ConfigKey,
  MiddlewareConfig,
} from './lib/types'
import {
  TracerExtMiddleware,
  TracerMiddleware,
} from './middleware/index.middleware'


@Configuration({
  namespace: ConfigKey.namespace,
  importConfigs: [join(__dirname, 'config')],
})
export class AutoConfiguration implements ILifeCycle {

  @App() readonly app: Application

  @Config(ConfigKey.config) protected readonly config: Conf
  @Config(ConfigKey.middlewareConfig) protected readonly mwConfig: MiddlewareConfig

  async onReady(): Promise<void> {
    assert(this.app, 'this.app must be set')

    if (this.config.enableDefaultRoute && this.mwConfig.ignore) {
      this.mwConfig.ignore.push(new RegExp(`/${ConfigKey.namespace}/.+`, 'u'))
    }

    await this.app.getApplicationContext().getAsync(TracerComponent)

    if (this.mwConfig.enableMiddleware) {
      registerMiddleware(this.app)
    }
  }

  async onServerReady(): Promise<void> {
    if (this.mwConfig.enableMiddleware) {
      // @ts-ignore
      this.app.getMiddleware().insertFirst(TracerMiddleware)
      void 0
    }
  }

  async onStop(container: IMidwayContainer): Promise<void> {
    const inst = await container.getAsync(TracerComponent)
    inst.close()
  }
}

export function registerMiddleware(
  app: Application,
): void {

  // @ts-ignore
  app.getMiddleware().insertLast(TracerExtMiddleware)
}

