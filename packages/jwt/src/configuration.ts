/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-extraneous-class */
import 'tsconfig-paths/register'

import { join } from 'path'

import { App, Config, Configuration } from '@midwayjs/decorator'
import { IMidwayWebApplication } from '@midwayjs/web'

import { JwtMiddlewareConfig } from './lib/index'


const namespace = 'jwt'

@Configuration({
  namespace,
  importConfigs: [join(__dirname, 'config')],
})
export class AutoConfiguration {

  @App() readonly app: IMidwayWebApplication

  @Config('JwtMiddlewareConfig') protected readonly config: JwtMiddlewareConfig

  async onReady(): Promise<void> {
    if (this.config.enableMiddleware) {
      registerMiddleware(this.app)
    }
  }

}

export function registerMiddleware(
  app: IMidwayWebApplication,
): void {

  const appMiddleware = app.getConfig('middleware') as string[]
  if (Array.isArray(appMiddleware)) {
    appMiddleware.push(namespace + ':jwtMiddleware')
  }
  else {
    app.logger.info('Jwt: appMiddleware is not valid Array, register via app.use(Middleware)')
    app.use(taskAgentMiddleware)
  }
}

