/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-extraneous-class */
import 'tsconfig-paths/register'

import { join } from 'path'

import { Configuration } from '@midwayjs/decorator'
import { IMidwayWebApplication } from '@midwayjs/web'
import * as fetch from '@mw-components/fetch'
import * as jaeger from '@mw-components/jaeger'
import * as db from '@mw-components/kmore'

import { taskAgentMiddleware } from './middleware/task-agent.middleware'


@Configuration({
  imports: [
    jaeger,
    fetch,
    db,
  ],
  importConfigs: [join(__dirname, 'config')],
})
export class AutoConfiguration {
  // @App() readonly app: IMidwayWebApplication

  // 目前 onReady() 无法正确执行，
  // 改为在项目的 configuration.ts 中执行 registerMiddleware() 注册中间件
  // async onReady(): Promise<void> {
  //   registerMiddleware(this.app)
  // }

}

export function registerMiddleware(
  app: IMidwayWebApplication,
): void {

  const appMiddleware = app.getConfig('middleware') as string[]
  if (Array.isArray(appMiddleware)) {
    appMiddleware.push('taskAgentMiddleware')
  }
  else {
    app.logger.info('TaskAgent appMiddleware is not valid Array, register via app.use(taskAgentMiddleware)')
    app.use(taskAgentMiddleware)
  }
}

