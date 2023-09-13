// https://mochajs.org/#global-fixtures
// https://mochajs.org/#root-hook-plugins
import assert from 'node:assert/strict'
import { rm } from 'node:fs/promises'
import { join } from 'node:path'

import { createApp, close, createHttpRequest } from '@midwayjs/mock'
import { Application } from '@mwcp/share'
import type { Suite } from 'mocha'

import { TestConfig, testConfig, cloudUrlPrefix, testDir } from './root.config.js'

import { AliOssManager } from '##/index.js'
import { ClientKey } from '##/lib/types.js'


let app: Application

export async function mochaGlobalSetup(this: Suite) {
  app = await createAppInstance()
  await updateConfig(app, testConfig)
  await updateConfig2(app, testConfig)
}

export async function mochaGlobalTeardown(this: Suite) {
  await clean(app, testConfig)
  await close(app)
}


/**
 * Update testConfig in place
 */
async function createAppInstance(): Promise<Application> {
  try {
    app = await createApp(testConfig.testAppDir) as Application
  }
  catch (ex) {
    console.error('createApp error:', ex)
    throw ex
  }

  assert(app, 'app not exists')

  const names = app.getMiddleware().getNames()
  console.info({ middlewares: names })

  return app
  // https://midwayjs.org/docs/testing
}

async function updateConfig(mockApp: Application, config: TestConfig): Promise<void> {
  config.app = mockApp
  config.httpRequest = createHttpRequest(mockApp)

  assert(config.httpRequest, 'httpRequest not exists')
  const { url } = config.httpRequest.get('/')
  config.host = url

  config.container = mockApp.getApplicationContext()
  // const svc = await testConfig.container.getAsync(TaskQueueService)
}

async function updateConfig2(mockApp: Application, config: TestConfig): Promise<void> {

  const container = mockApp.getApplicationContext()
  const aliOssManager = await container.getAsync(AliOssManager)
  config.aliOssManager = aliOssManager

  const client = aliOssManager.getDataSource(ClientKey.unitTest)
  testConfig.ossClient = client

  const target = `${cloudUrlPrefix}/`

  await client.rmrf(target)
  const ret = await client.mkdir(target)
  assert(! ret.exitCode, `mkdir ${target} failed, ${ret.stderr}`)
  assert(ret.data)
}

async function clean(mockApp: Application, config: TestConfig): Promise<void> {
  void mockApp

  const { ossClient } = config
  const target = `${cloudUrlPrefix}/`

  const ret = await ossClient.rmrf(target)
  assert(! ret.exitCode, `mkdir ${target} failed, ${ret.stderr}`)
  assert(ret.data)

  await rm(join(config.testDir, 'tmp'), { recursive: true }).catch(() => void 0)
}
