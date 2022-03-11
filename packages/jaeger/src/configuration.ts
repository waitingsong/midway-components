import 'tsconfig-paths/register'

import { join } from 'path'

import { App, Config, Configuration, Inject } from '@midwayjs/decorator'
import { NpmPkg } from '@waiting/shared-types'

import { TracerComponent } from './lib/component'
import { TracerExtMiddleware } from './middleware/tracer-ext.middleware'
import { TracerMiddleware } from './middleware/tracer.middleware'

import { ConfigKey, MiddlewareConfig } from '~/index'
import {
  Application,
  IMidwayContainer,
  MidwayInformationService,
} from '~/interface'


@Configuration({
  namespace: ConfigKey.namespace,
  importConfigs: [join(__dirname, 'config')],
})
export class AutoConfiguration {

  @App() readonly app: Application

  @Config(ConfigKey.middlewareConfig) protected readonly mwConfig: MiddlewareConfig

  @Inject() informationService: MidwayInformationService

  async onConfigLoad(): Promise<void> {
    const pkgNow = this.app.getConfig('pkg') as unknown
    if (! pkgNow) {
      const pkg = this.informationService.getPkg() as NpmPkg
      this.app.addConfigObject({
        pkg,
      })
    }
  }

  async onReady(): Promise<void> {
    if (! this.app) {
      throw new TypeError('this.app invalid')
    }

    await this.app.getApplicationContext().getAsync(TracerComponent)

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

