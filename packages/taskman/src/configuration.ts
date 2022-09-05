import 'tsconfig-paths/register'
import { join } from 'node:path'

import { App, Config, Configuration, Inject } from '@midwayjs/decorator'
import * as fetch from '@mwcp/fetch'
import * as jaeger from '@mwcp/jaeger'
import * as db from '@mwcp/kmore'
import { DbConfig, DbSourceManager } from '@mwcp/kmore'
import * as koid from '@mwcp/koid'
import type { Application, Context, IMidwayContainer } from '@mwcp/share'

import {
  ConfigKey,
  DbModel,
  DbReplica,
  MiddlewareConfig,
  TaskClientConfig,
  TaskServerConfig,
} from './lib/index'
import { TaskManMiddleware } from './middleware/taskman.middleware'
import { TaskAgentService } from './service/task-agent.service'


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
    // const dbConfig = genKmoreDbConfig(
    //   this.serverConfig,
    //   initDbConfig,
    // )
    const dbConfig = this.serverConfig.dataSource[DbReplica.taskMaster] as DbConfig<DbModel, Context>
    await this.dbManager.createInstance<DbModel>(
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

  // @ts-ignore
  app.getMiddleware().insertLast(TaskManMiddleware)
}

