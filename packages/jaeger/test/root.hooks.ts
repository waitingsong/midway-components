/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import 'tsconfig-paths/register'

import { createApp, close } from '@midwayjs/mock'
import { Framework } from '@midwayjs/web'


import { testConfig } from './test-config'


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
    },

    beforeEach: async () => {
    },

    afterEach: async () => {
    },

    afterAll: async () => {
      if (testConfig.app) {
        await close(testConfig.app)
      }
    },
  }

}

