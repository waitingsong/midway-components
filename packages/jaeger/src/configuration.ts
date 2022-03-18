import 'tsconfig-paths/register'

import { join } from 'path'

import { MidwayInformationService } from '@midwayjs/core'
import { App, Config, Configuration, Inject } from '@midwayjs/decorator'
import { NpmPkg } from '@waiting/shared-types'

import {
  ConfigKey,
  MiddlewareConfig,
  TracerComponent,
  TracerExtMiddleware,
  TracerMiddleware,
} from './index'

import {
  Application,
  IMidwayContainer,
} from '~/interface'


@Configuration({
  namespace: ConfigKey.namespace,
  importConfigs: [join(__dirname, 'config')],
})
export class AutoConfiguration {

  @App() readonly app: Application

  @Config(ConfigKey.middlewareConfig) protected readonly mwConfig: MiddlewareConfig

  @Inject() readonly informationService: MidwayInformationService

  async onReady(): Promise<void> {
    if (! this.app) {
      throw new TypeError('this.app invalid')
    }

    const pkgNow = this.app.getConfig('pkg') as unknown
    if (! pkgNow) {
      if (this.informationService) {
        const pkg = this.informationService.getPkg() as NpmPkg
        this.app.addConfigObject({
          pkg,
        })
      }
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

