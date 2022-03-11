import 'tsconfig-paths/register'

import { join } from 'path'

import { App, Config, Configuration } from '@midwayjs/decorator'

import { TracerComponent } from './lib/component'
import { TracerExtMiddleware } from './middleware/tracer-ext.middleware'
import { TracerMiddleware } from './middleware/tracer.middleware'

import { ConfigKey, MiddlewareConfig } from '~/index'
import { Application, IMidwayContainer } from '~/interface'


@Configuration({
  namespace: ConfigKey.namespace,
  importConfigs: [join(__dirname, 'config')],
})
export class AutoConfiguration {

  @App() readonly app: Application

  @Config(ConfigKey.middlewareConfig) protected readonly mwConfig: MiddlewareConfig

  async onReady(): Promise<void> {
    if (! this.app) {
      throw new TypeError('this.app invalid')
    }

    if (this.mwConfig.enableMiddleware) {
      registerMiddleware(this.app)
    }
  }

  async onServerReady(): Promise<void> {
    if (this.mwConfig.enableMiddleware) {
      // @ts-expect-error
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

  // @ts-expect-error
  app.getMiddleware().insertLast(TracerExtMiddleware)
}

