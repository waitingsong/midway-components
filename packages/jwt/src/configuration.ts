/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-extraneous-class */
import 'tsconfig-paths/register'

import { join } from 'path'

import { App, Config, Configuration } from '@midwayjs/decorator'
import { IMidwayWebApplication } from '@midwayjs/web'

import { JwtMiddlewareConfig } from './lib/index'
import { jwtMiddleware } from './middleware/jwt.middleware'


const namespace = 'jwt'

@Configuration({
  namespace,
  importConfigs: [join(__dirname, 'config')],
})
export class AutoConfiguration {

  @App() readonly app: IMidwayWebApplication

  @Config('jwtMiddlewareConfig') protected readonly mwConfig: JwtMiddlewareConfig

  async onReady(): Promise<void> {
    const { enableMiddleware } = this.mwConfig
    /* istanbul ignore else */
    if (enableMiddleware || typeof enableMiddleware === 'number') {
      registerMiddleware(this.app, enableMiddleware)
    }
  }

}

export function registerMiddleware(
  app: IMidwayWebApplication,
  position: true | number,
): void {

  const appMiddleware = app.getConfig('middleware') as string[] | undefined
  /* istanbul ignore if */
  if (Array.isArray(appMiddleware)) {
    const pos = position === true ? 0 : position
    appMiddleware.splice(pos, 0, namespace + ':jwtMiddleware')
  }
  else {
    app.logger.info('Jwt: appMiddleware is not valid Array, register via app.use(Middleware)')
    app.use(jwtMiddleware)
  }
}

