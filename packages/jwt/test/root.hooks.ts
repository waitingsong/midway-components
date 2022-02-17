/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import 'tsconfig-paths/register'

import * as WEB from '@midwayjs/koa'
import { createApp, close } from '@midwayjs/mock'

import { testConfig } from './root.config'
import { jwtConfig } from './test.config'

import { Application } from '~/interface'


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
        jwtConfig,
      }
      const opts = {
        imports: [WEB],
        globalConfig: configs,
      }
      const app = await createApp(void 0, opts) as Application
      app.addConfigObject(configs)
      testConfig.app = app

      // const frameworkType = app.getFrameworkType()
      // const names = app.getMiddleware().getNames()
      // const ctx = app.createAnonymousContext()
      // https:// www.yuque.com/midwayjs/midway_v2/testing
      // const svc = await app.getApplicationContext().getAsync(TaskQueueService)
    },

    beforeEach: async () => {
    },

    afterEach: async () => {
      const { app } = testConfig
      app.addConfigObject({
        jwtConfig,
      })
    },

    afterAll: async () => {
      if (testConfig.app) {
        await close(testConfig.app)
      }
    },
  }

}

