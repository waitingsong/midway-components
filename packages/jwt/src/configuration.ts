/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-extraneous-class */
import 'tsconfig-paths/register'

import { join } from 'path'

import { App, Config, Configuration } from '@midwayjs/decorator'
import { IMidwayWebApplication } from '@midwayjs/web'


const namespace = 'jwt'

@Configuration({
  namespace,
  importConfigs: [join(__dirname, 'config')],
})
export class AutoConfiguration {

  @App() readonly app: IMidwayWebApplication

  @Config('taskManServerConfig') protected readonly config: TaskManServerConfig

  async onReady(): Promise<void> {

    registerMiddleware(this.app)
  }

}

export function registerMiddleware(
  app: IMidwayWebApplication,
): void {

  const appMiddleware = app.getConfig('middleware') as string[]
  if (Array.isArray(appMiddleware)) {
    appMiddleware.push(namespace + ':taskAgentMiddleware')
  }
  else {
    app.logger.info('TaskAgent appMiddleware is not valid Array, register via app.use(taskAgentMiddleware)')
    app.use(taskAgentMiddleware)
  }
}

