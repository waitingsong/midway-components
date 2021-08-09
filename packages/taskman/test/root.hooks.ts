/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import 'tsconfig-paths/register'

import { createApp, close } from '@midwayjs/mock'
import { Framework } from '@midwayjs/web'

import { TaskLogRepository, TaskQueueRepository, TaskResultRepository } from '../src/repo/index.repo'
import { TaskAgentService, TaskQueueService } from '../src/service/index.service'

import { testConfig } from './test-config'

import { TaskManComponent } from '~/lib'


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
      const app = await createApp<Framework>()
      testConfig.app = app
      const ctx = app.createAnonymousContext()
      // https:// www.yuque.com/midwayjs/midway_v2/testing
      // const svc = await app.getApplicationContext().getAsync(TaskQueueService)
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

