import 'tsconfig-paths/register'

import { join } from 'path'

import { App, Config, Configuration } from '@midwayjs/decorator'

import { JwtMiddleware } from './middleware/jwt.middleware'

import { ConfigKey, MiddlewareConfig } from '~/index'
import { Application } from '~/interface'


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

    const { enableMiddleware } = this.mwConfig
    if (enableMiddleware || typeof enableMiddleware === 'number') {
      registerMiddleware(this.app)
    }
  }

}

export function registerMiddleware(
  app: Application,
): void {

  // @ts-expect-error
  app.getMiddleware().insertLast(JwtMiddleware)
  // const names = app.getMiddleware().getNames()
  // console.log({ names })
}

