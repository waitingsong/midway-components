import 'tsconfig-paths/register'
import { join } from 'node:path'

import {
  App,
  Config,
  Configuration,
  ILogger,
  Inject,
  Logger,
} from '@midwayjs/core'
import { DbConfig, DbSourceManager } from '@mwcp/kmore'
import { TraceInit } from '@mwcp/otel'
import type { Application, Context, IMidwayContainer } from '@mwcp/share'

import { useComponents } from './imports'
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
  importConfigs: [join(__dirname, 'config')],
  imports: useComponents,
})
export class AutoConfiguration {

  @App() readonly app: Application

  @Logger() logger: ILogger

  @Config(ConfigKey.serverConfig) protected readonly serverConfig: TaskServerConfig
  @Config(ConfigKey.clientConfig) protected readonly clientConfig: TaskClientConfig
  @Config(ConfigKey.middlewareConfig) protected readonly mwConfig: MiddlewareConfig

  @Inject() dbManager: DbSourceManager<DbReplica.taskMaster, DbModel, Context>

  @TraceInit({ namespace: ConfigKey.namespace })
  async onReady(container: IMidwayContainer): Promise<void> {
    void container
    const dbConfig = this.serverConfig.dataSource[DbReplica.taskMaster] as DbConfig<DbModel, Context>
    await this.dbManager.createInstance<DbModel>(
      dbConfig,
      DbReplica.taskMaster,
    )

    if (this.mwConfig.enableMiddleware) {
      registerMiddleware(this.app)
    }
  }

  async onStop(container: IMidwayContainer): Promise<void> {
    this.logger.info('[taskman] onStop()')
    const agentSvc = await container.getAsync(TaskAgentService)
    agentSvc.stop()
  }
}

export function registerMiddleware(
  app: Application,
): void {

  // @ts-ignore
  app.getMiddleware().insertLast(TaskManMiddleware)
}

