/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-extraneous-class */
import 'tsconfig-paths/register'

import { join } from 'path'

import { IMidwayContainer } from '@midwayjs/core'
import { App, Config, Configuration, Inject } from '@midwayjs/decorator'
import * as fetch from '@mw-components/fetch'
import * as jaeger from '@mw-components/jaeger'
import * as db from '@mw-components/kmore'
import { DbSourceManager } from '@mw-components/kmore'
import * as koid from '@mw-components/koid'

import {
  ConfigKey,
  DbModel,
  DbReplica,
  initDbConfig,
  MiddlewareConfig,
  TaskClientConfig,
  TaskServerConfig,
} from './lib/index'
import { TaskManMiddleware } from './middleware/taskman.middleware'
import { genKmoreDbConfig } from './repo/helper'
import { TaskAgentService } from './service/task-agent.service'

import type { Application, Context } from '~/interface'


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
  @Config(ConfigKey.middlewareConfig) protected readonly mwConfig: MiddlewareConfig

  @Inject() dbManager: DbSourceManager<DbReplica.taskMaster, DbModel, Context>

  async onReady(container: IMidwayContainer): Promise<void> {
    const dbConfig = genKmoreDbConfig(
      this.serverConfig,
      initDbConfig,
    )

    await this.dbManager.createInstance<DbModel>(
      // this.serverConfig.dataSource[DbReplica.taskMaster],
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      dbConfig,
      DbReplica.taskMaster,
    )

    const agentSvc = await container.getAsync(TaskAgentService)
    await agentSvc.run()

    if (this.mwConfig.enableMiddleware) {
      registerMiddleware(this.app)
    }

  }

}

export function registerMiddleware(
  app: Application,
): void {

  // @ts-expect-error
  app.getMiddleware().insertLast(TaskManMiddleware)
}

