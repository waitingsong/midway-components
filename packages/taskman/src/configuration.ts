/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-extraneous-class */
import 'tsconfig-paths/register'

import { join } from 'path'

import { IMidwayContainer } from '@midwayjs/core'
import { App, Config, Configuration } from '@midwayjs/decorator'
import * as fetch from '@mw-components/fetch'
import * as jaeger from '@mw-components/jaeger'
import * as db from '@mw-components/kmore'
import * as koid from '@mw-components/koid'

import {
  ConfigKey,
  initDbConfig,
  DbReplica,
  DbReplicaKeys,
  TaskClientConfig,
  TaskServerConfig,
} from './lib/index'
import { genKmoreDbConfig } from './repo/helper'
import { TaskAgentService } from './service/task-agent.service'

import type { Application } from '~/interface'


@Configuration({
  namespace: ConfigKey.namespace,
  imports: [
    koid,
    jaeger,
    fetch,
    db,
  ],
  importConfigs: [join(__dirname, 'config')],
})
export class AutoConfiguration {

  @App() readonly app: Application

  @Config(ConfigKey.serverConfig) protected readonly serverConfig: TaskServerConfig
  @Config(ConfigKey.clientConfig) protected readonly clientConfig: TaskClientConfig

  async onReady(container: IMidwayContainer): Promise<void> {
    // const container = this.app.getApplicationContext()
    const dbConfig = genKmoreDbConfig(this.serverConfig, initDbConfig)
    const dbManager = await container.getAsync(db.DbManager) as db.DbManager<DbReplicaKeys>
    await dbManager.connect(DbReplica.taskMaster, dbConfig)

    const agentSvc = await container.getAsync(TaskAgentService)
    await agentSvc.run()

    // registerMiddleware(this.app)
  }

}

// export function registerMiddleware(
//   app: Application,
// ): void {

//   // @ts-expect-error
//   app.getMiddleware().insertLast(TaskAgentMiddleware)
// }

