import 'tsconfig-paths/register'
import assert from 'node:assert/strict'
import { join } from 'node:path'

import * as WEB from '@midwayjs/koa'
import { createApp, close, createHttpRequest } from '@midwayjs/mock'
import type { Application } from '@mwcp/share'

import { TaskLogRepository, TaskQueueRepository, TaskResultRepository } from '../src/repo/index.repo'
import { TaskAgentService, TaskQueueService } from '../src/service/index.service'

import { testConfig } from '@/root.config'
import { ClientService, ConfigKey } from '~/index'


/**
 * @see https://mochajs.org/#root-hook-plugins
 * beforeAll:
 *  - In serial mode(Mocha’s default ), before all tests begin, once only
 *  - In parallel mode, run before all tests begin, for each file
 * beforeEach:
 *  - In both modes, run before each test
 */
export const mochaHooks = async () => {
  // avoid run multi times
  if (! process.env['mochaRootHookFlag']) {
    process.env['mochaRootHookFlag'] = 'true'
  }

  return {
    beforeAll: async () => {
      const globalConfig = {
        keys: Math.random().toString(),
        pkg: {
          name: 'test',
          version: '1.0.0',
        },
        // [ConfigKey.clientConfig]: taskClientConfig,
        // [ConfigKey.serverConfig]: taskServerConfig,
      }
      const opts = {
        imports: [WEB],
        globalConfig,
      }
      const app = await createApp(join(__dirname, 'fixtures', 'base-app'), opts) as Application
      app.addConfigObject(globalConfig)
      testConfig.app = app
      testConfig.httpRequest = createHttpRequest(app)

      // const frameworkType = app.getFrameworkType()
      // const names = app.getMiddleware().getNames()
      const ctx = app.createAnonymousContext()
      // https://www.yuque.com/midwayjs/midway_v2/testing
      // https://midwayjs.org/docs/testing
      // const svc = await app.getApplicationContext().getAsync(TaskQueueService)
      const { url } = testConfig.httpRequest.get('/')
      testConfig.host = url

      const host = url.slice(0, -1)
      // app.addConfigObject({
      //   security: {
      //     csrf: false,
      //   },
      //   taskManClientConfig: {
      //     host: url.slice(0, -1),
      //   },
      // })
      // globalConfig[ConfigKey.clientConfig].host = host
      // globalConfig[ConfigKey.serverConfig].host = host
      // app.addConfigObject(globalConfig)

      testConfig.container = app.getApplicationContext()
      const container = app.getApplicationContext()
      testConfig.svc = await container.getAsync(TaskQueueService)
      testConfig.repo = await container.getAsync(TaskQueueRepository)
      testConfig.logRepo = await container.getAsync(TaskLogRepository)
      testConfig.retRepo = await container.getAsync(TaskResultRepository)
      testConfig.agent = await container.getAsync(TaskAgentService)
      testConfig.tm = await container.getAsync(ClientService)

    },

    beforeEach: async () => {
      const { repo } = testConfig
      await Promise.all([repo.db.refTables.ref_tb_task().del()])
    },

    afterEach: async () => {
      const { repo } = testConfig
      await Promise.all([repo.db.refTables.ref_tb_task().del()])
    },

    afterAll: async () => {
      if (testConfig.app) {
        await close(testConfig.app)
      }
    },
  }

}

