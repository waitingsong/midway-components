import { IncomingHttpHeaders } from 'http'

import supertest, { SuperTest } from 'supertest'

import { taskClientConfig } from './test.config'

import { Config, MiddlewareConfig } from '~/index'
import { Application } from '~/interface'
import {
  TaskLogRepository,
  TaskQueueRepository,
  TaskResultRepository,
} from '~/repo/index.repo'
import { ClientService, TaskAgentService, TaskQueueService } from '~/service/index.service'


export type TestResponse = supertest.Response
export interface TestRespBody {
  config: Config
  mwConfig: MiddlewareConfig
  cookies: unknown
  header: IncomingHttpHeaders
  url: string
}

export interface TestConfig {
  config: Config
  /** host of test process */
  host: string
  app: Application
  httpRequest: SuperTest<supertest.Test>
  agent: TaskAgentService
  svc: TaskQueueService
  repo: TaskQueueRepository
  logRepo: TaskLogRepository
  retRepo: TaskResultRepository
  tm: ClientService
}
export const testConfig = {
  config: taskClientConfig,
} as TestConfig

