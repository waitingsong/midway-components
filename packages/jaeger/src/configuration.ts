/* eslint-disable @typescript-eslint/no-extraneous-class */
import 'tsconfig-paths/register'

import { join } from 'path'

import { MidwayInformationService } from '@midwayjs/core'
import { App, Config, Configuration } from '@midwayjs/decorator'
import { NpmPkg } from '@waiting/shared-types'

import {
  ConfigKey,
  MiddlewareConfig,
  TracerComponent,
} from './lib/index'
import {
  TracerExtMiddleware,
  TracerMiddleware,
} from './middleware/index.middleware'

import type { Application, IMidwayContainer } from '~/interface'


@Configuration({
  namespace: ConfigKey.namespace,
  importConfigs: [join(__dirname, 'config')],
})
export class AutoConfiguration {

  @App() readonly app: Application

  @Config(ConfigKey.middlewareConfig) protected readonly mwConfig: MiddlewareConfig

  // @Inject() readonly informationService: MidwayInformationService

  async onReady(): Promise<void> {
    if (! this.app) {
      throw new TypeError('this.app invalid')
    }

    const pkgNow = this.app.getConfig('pkg') as unknown
    if (! pkgNow) {
      try {
        const informationService = await this.app.getApplicationContext().getAsync(MidwayInformationService)
        if (informationService) {
          const pkg = informationService.getPkg() as NpmPkg
          this.app.addConfigObject({
            pkg,
          })
        }
      }
      catch (ex) {
        console.error(ex)
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

