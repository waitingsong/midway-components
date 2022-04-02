import { IncomingHttpHeaders } from 'http'

import supertest, { SuperTest } from 'supertest'

import { taskClientConfig } from '@/config.unittest'
import { Application } from '~/interface'
import { ClientService, Config, MiddlewareConfig } from '~/lib'
import {
  TaskLogRepository,
  TaskQueueRepository,
  TaskResultRepository,
} from '~/repo/index.repo'
import { TaskAgentService, TaskQueueService } from '~/service/index.service'


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

