import 'tsconfig-paths/register'

import assert from 'assert/strict'
import { join } from 'path'

import * as WEB from '@midwayjs/koa'
import { createApp, close, createHttpRequest } from '@midwayjs/mock'

import { TaskLogRepository, TaskQueueRepository, TaskResultRepository } from '../src/repo/index.repo'
import { TaskAgentService, TaskQueueService } from '../src/service/index.service'

import { testConfig } from './root.config'

import { Application } from '~/interface'
import {
  initTaskManClientConfig,
  TaskManClientConfig,
  TaskManComponent,
} from '~/lib'


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
  if (! process.env.mochaRootHookFlag) {
    process.env.mochaRootHookFlag = 'true'
  }

  return {
    beforeAll: async () => {
      const configs = {
        keys: Math.random().toString(),
      }
      const opts = {
        imports: [WEB],
        globalConfig: configs,
      }
      const app = await createApp(join(__dirname, 'fixtures', 'base-app'), opts) as Application
      app.addConfigObject(configs)
      testConfig.app = app
      testConfig.httpRequest = createHttpRequest(app)

      // const frameworkType = app.getFrameworkType()
      // const names = app.getMiddleware().getNames()
      const ctx = app.createAnonymousContext()
      // https:// www.yuque.com/midwayjs/midway_v2/testing
      // const svc = await app.getApplicationContext().getAsync(TaskQueueService)
      const { url } = testConfig.httpRequest.get('/')
      testConfig.host = url


      app.addConfigObject({
        security: {
          csrf: false,
        },
        taskManClientConfig: {
          ...initTaskManClientConfig,
          host: url.slice(0, -1),
        },
      })
      const tmcConfig = app.getConfig('taskManClientConfig') as TaskManClientConfig
      assert(testConfig.host === tmcConfig.host + '/')

      testConfig.svc = await ctx.requestContext.getAsync(TaskQueueService)
      testConfig.repo = await ctx.requestContext.getAsync(TaskQueueRepository)
      testConfig.logRepo = await ctx.requestContext.getAsync(TaskLogRepository)
      testConfig.retRepo = await ctx.requestContext.getAsync(TaskResultRepository)
      testConfig.agent = await ctx.requestContext.getAsync(TaskAgentService)
      testConfig.tm = await ctx.requestContext.getAsync(TaskManComponent)



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

