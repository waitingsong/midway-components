/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-extraneous-class */
import 'tsconfig-paths/register'

import { join } from 'path'

import { IMidwayContainer } from '@midwayjs/core'
import { App, Config, Configuration } from '@midwayjs/decorator'
import { IMidwayWebApplication } from '@midwayjs/web'
import * as fetch from '@mw-components/fetch'
import * as jaeger from '@mw-components/jaeger'
import * as db from '@mw-components/kmore'
import { DbManager } from '@mw-components/kmore'

import { taskRunnerState } from './lib/config'
import {
  TaskManServerConfig,
  initDbConfig,
  DbReplica,
  DbReplicaKeys, TaskManClientConfig,
} from './lib/index'
import { TaskAgentMiddleware } from './middleware/task-agent.middleware'
import { genKmoreDbConfig } from './repo/helper'

import { Application } from '~/interface'


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

  @App() readonly app: Application

  @Config('taskManServerConfig') protected readonly serverConfig: TaskManServerConfig
  @Config('taskManClientConfig') protected readonly clientConfig: TaskManClientConfig

  async onReady(container: IMidwayContainer): Promise<void> {
    // const container = this.app.getApplicationContext()
    const dbConfig = genKmoreDbConfig(this.serverConfig, initDbConfig)
    const dbManager = await container.getAsync(DbManager) as DbManager<DbReplicaKeys>
    await dbManager.connect(DbReplica.taskMaster, dbConfig)

    if (this.clientConfig.maxRunner > 0) {
      taskRunnerState.max = this.clientConfig.maxRunner
    }

    registerMiddleware(this.app)
  }

}

export function registerMiddleware(
  app: Application,
): void {

  // @ts-expect-error
  app.getMiddleware().insertLast(TaskAgentMiddleware)
}

