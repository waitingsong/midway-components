/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-extraneous-class */
import 'tsconfig-paths/register'

import { join } from 'path'

import { App, Config, Configuration } from '@midwayjs/decorator'
import { IMidwayWebApplication } from '@midwayjs/web'
import * as fetch from '@mw-components/fetch'
import * as jaeger from '@mw-components/jaeger'
import * as db from '@mw-components/kmore'
import { DbManager } from '@mw-components/kmore'

import { TaskManServerConfig, initDbConfig, DbReplica, DbReplicaKeys } from './lib/index'
import { taskAgentMiddleware } from './middleware/task-agent.middleware'
import { genKmoreDbConfig } from './repo/helper'


const namespace = 'taskman'

@Configuration({
  namespace,
  imports: [
    jaeger,
    fetch,
    db,
  ],
  importConfigs: [join(__dirname, 'config')],
})
export class AutoConfiguration {

  @App() readonly app: IMidwayWebApplication

  @Config('taskManServerConfig') protected readonly serverConfig: TaskManServerConfig

  async onReady(): Promise<void> {
    const dbConfig = genKmoreDbConfig(this.serverConfig, initDbConfig)
    const container = this.app.getApplicationContext()
    const dbManager = await container.getAsync(DbManager) as DbManager<DbReplicaKeys>
    await dbManager.connect(DbReplica.taskMaster, dbConfig)

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

