// https://mochajs.org/#global-fixtures
// https://mochajs.org/#root-hook-plugins
import assert from 'node:assert'

import { createApp, close, createHttpRequest } from '@midwayjs/mock'
import { Application } from '@mwcp/share'
import type { Suite } from 'mocha'

import { ConfigKey } from '../src/lib/types.js'

import { taskClientConfig, taskServerConfig } from './config.unittest.js'
import { TestConfig, testConfig } from './root.config.js'

import {
  ClientService,
  TaskAgentService,
  TaskLogRepository,
  TaskQueueRepository,
  TaskQueueService,
  TaskResultRepository,
} from '##/index.js'


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
  const globalConfig = {
    keys: Math.random().toString(),
    [ConfigKey.clientConfig]: taskClientConfig,
    [ConfigKey.serverConfig]: taskServerConfig,
  }
  const opts = {
    globalConfig,
  }

  try {
    app = await createApp(testConfig.testAppDir) as Application
  }
  catch (ex) {
    console.error('createApp error:', ex)
    throw ex
  }

  assert(app, 'app not exists')
  // const globalConfig = {
  //   keys: Math.random().toString(),
  // }
  // app.addConfigObject(globalConfig)

  const middlewares = app.getMiddleware().getNames()
  console.info({ middlewares })

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

  testConfig.svc = await config.container.getAsync(TaskQueueService)
  testConfig.repo = await config.container.getAsync(TaskQueueRepository)
  testConfig.logRepo = await config.container.getAsync(TaskLogRepository)
  testConfig.retRepo = await config.container.getAsync(TaskResultRepository)
  testConfig.agent = await config.container.getAsync(TaskAgentService)
  testConfig.tm = await config.container.getAsync(ClientService)
}

async function updateConfig2(mockApp: Application, config: TestConfig): Promise<void> {
  void mockApp, config
}

async function clean(mockApp: Application, config: TestConfig): Promise<void> {
  void mockApp, config
}
