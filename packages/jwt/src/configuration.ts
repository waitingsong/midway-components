/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-extraneous-class */
import 'tsconfig-paths/register'

import { join } from 'path'

import { App, Config, Configuration } from '@midwayjs/decorator'

import { ConfigKey, MiddlewareConfig } from './lib/index'
import { JwtMiddleware } from './middleware/jwt.middleware'


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
  // position: true | number,
): void {

  // @ts-expect-error
  app.getMiddleware().insertLast(JwtMiddleware)
  // const names = app.getMiddleware().getNames()
  // console.log({ names })

  // /* istanbul ignore if */
  // if (Array.isArray(appMiddleware)) {
  //   const pos = position === true ? 0 : position
  //   appMiddleware.splice(pos, 0, namespace + ':jwtMiddleware')
  // }
  // else {
  //   app.logger.info('Jwt: appMiddleware is not valid Array, register via app.use(Middleware)')
  //   app.use(jwtMiddleware)
  // }
}

