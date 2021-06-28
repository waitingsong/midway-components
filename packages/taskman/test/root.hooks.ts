/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import 'tsconfig-paths/register'

import { createApp, close } from '@midwayjs/mock'
import { Framework } from '@midwayjs/web'

import { testConfig } from './test-config'

import { TaskQueueRepository } from '~/repo/index.repo'
import { TaskAgentService, TaskQueueService } from '~/service/index.service'


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
      const app = await createApp<Framework>(void 0, void 0, Framework)
      testConfig.app = app
      const ctx = app.createAnonymousContext()
      // https:// www.yuque.com/midwayjs/midway_v2/testing
      // const svc = await app.getApplicationContext().getAsync(TaskQueueService)
      testConfig.svc = await ctx.requestContext.getAsync(TaskQueueService)
      testConfig.repo = await ctx.requestContext.getAsync(TaskQueueRepository)
      testConfig.agent = await ctx.requestContext.getAsync(TaskAgentService)
    },

    beforeEach: async () => {
      const { repo } = testConfig
      await Promise.all([
        repo.db.refTables.ref_tb_task().del(),
        repo.db.refTables.ref_tb_task_payload().del(),
      ])
    },

    afterEach: async () => {
      const { repo } = testConfig
      await Promise.all([
        repo.db.refTables.ref_tb_task().del(),
        repo.db.refTables.ref_tb_task_payload().del(),
      ])
    },

    afterAll: async () => {
      if (testConfig.app) {
        await close(testConfig.app)
      }
    },
  }

}

