/* eslint-disable import/max-dependencies */
import assert from 'node:assert'

import {
  App,
  Config,
  Configuration,
  MidwayEnvironmentService,
  MidwayInformationService,
  ILifeCycle,
  ILogger,
  Inject,
  Logger,
} from '@midwayjs/core'
import { DbConfig, DbSourceManager } from '@mwcp/kmore'
import { TraceInit } from '@mwcp/otel'
import {
  Application,
  Context,
  IMidwayContainer,
  registerMiddleware,
} from '@mwcp/share'

import * as DefulatConfig from './config/config.default.js'
// import * as LocalConfig from './config/config.local.js'
import * as UnittestConfig from './config/config.unittest.js'
import { useComponents } from './imports.js'
import {
  ConfigKey,
  DbModel,
  DbReplica,
  MiddlewareConfig,
  TaskClientConfig,
  TaskServerConfig,
} from './lib/index.js'
import { TaskManMiddleware } from './middleware/index.middleware.js'
import { TaskAgentService } from './service/task-agent.service.js'


@Configuration({
  namespace: ConfigKey.namespace,
  importConfigs: [
    {
      default: DefulatConfig,
      // local: LocalConfig,
      unittest: UnittestConfig,
    },
  ],
  imports: useComponents,
})
export class AutoConfiguration implements ILifeCycle {

  @App() readonly app: Application


  @Config(ConfigKey.serverConfig) protected readonly serverConfig: TaskServerConfig
  @Config(ConfigKey.clientConfig) protected readonly clientConfig: TaskClientConfig
  @Config(ConfigKey.middlewareConfig) protected readonly mwConfig: MiddlewareConfig

  @Inject() protected readonly environmentService: MidwayEnvironmentService
  @Inject() protected readonly informationService: MidwayInformationService
  @Logger() protected readonly logger: ILogger

  @Inject() dbManager: DbSourceManager<DbReplica.taskMaster, DbModel, Context>

  @TraceInit({ namespace: ConfigKey.namespace })
  async onReady(container: IMidwayContainer): Promise<void> {
    void container
    assert(
      this.app,
      'this.app undefined. If start for development, please set env first like `export MIDWAY_SERVER_ENV=local`',
    )

    const dbConfig = this.serverConfig.dataSource[DbReplica.taskMaster] as DbConfig<DbModel, Context>
    await this.dbManager.createInstance<DbModel>(
      dbConfig,
      DbReplica.taskMaster,
    )

    if (this.mwConfig.enableMiddleware) {
      registerMiddleware(this.app, TaskManMiddleware)
    }

    await container.getAsync(TaskAgentService)

    this.logger.info(`[${ConfigKey.componentName}] onReady`)
  }

  async onStop(container: IMidwayContainer): Promise<void> {
    const agentSvc = await container.getAsync(TaskAgentService)
    agentSvc.stop()
    this.logger.info(`[${ConfigKey.componentName}] onStop`)
  }
}

