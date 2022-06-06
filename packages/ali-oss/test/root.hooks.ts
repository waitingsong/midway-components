import 'tsconfig-paths/register'
import assert from 'node:assert/strict'
import { rm } from 'node:fs/promises'
import { join } from 'node:path'

import * as WEB from '@midwayjs/koa'
import { createApp, close, createHttpRequest } from '@midwayjs/mock'

import { aliOssConfig } from '@/config.unittest'
import { cloudUrlPrefix, testConfig, testDir } from '@/root.config'
import { AliOssComponent, ClientKey, ConfigKey } from '~/index'
import { Application } from '~/interface'


const target = `${cloudUrlPrefix}/`

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
      const globalConfig = {
        keys: Math.random().toString(),
        [ConfigKey.config]: aliOssConfig,
      }
      const opts = {
        imports: [WEB],
        globalConfig,
      }
      const app = await createApp(join(__dirname, 'fixtures', 'base-app'), opts) as Application
      app.addConfigObject(globalConfig)
      testConfig.app = app
      testConfig.httpRequest = createHttpRequest(app)
      const { url } = testConfig.httpRequest.get('/')
      testConfig.host = url

      // https://midwayjs.org/docs/testing


      const container = app.getApplicationContext()
      const ossClient = await container.getAsync(AliOssComponent)
      testConfig.ossClient = ossClient

      await ossClient.rmrf(ClientKey.master, target)
      const ret = await ossClient.mkdir(ClientKey.master, target)
      assert(! ret.exitCode, `mkdir ${target} failed, ${ret.stderr}`)
      assert(ret.data)
    },

    beforeEach: async () => {
      return
    },

    afterEach: async () => {
      const { app } = testConfig
      app.addConfigObject({
        [ConfigKey.config]: aliOssConfig,
      })
    },

    afterAll: async () => {
      const { ossClient } = testConfig

      const ret = await ossClient.rmrf(ClientKey.master, target)
      assert(! ret.exitCode, `mkdir ${target} failed, ${ret.stderr}`)
      assert(ret.data)

      try {
        await rm(join(testDir, 'tmp'), { recursive: true })
      }
      catch {
        void 0
      }

      if (testConfig.app) {
        await close(testConfig.app)
      }
    },
  }

}

