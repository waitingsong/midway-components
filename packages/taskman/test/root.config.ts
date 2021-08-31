import { IncomingHttpHeaders } from 'node:http'

import supertest, { SuperTest } from 'supertest'

import { taskClientConfig as config } from '@/config.unittest'
import { Application, IMidwayContainer } from '~/interface'
import {
  ClientService,
  Config,
  MiddlewareConfig,
} from '~/lib/index'
import {
  TaskLogRepository,
  TaskQueueRepository,
  TaskResultRepository,
} from '~/repo/index.repo'
import { TaskAgentService, TaskQueueService } from '~/service/index.service'


const CI = !! process.env.CI
export type TestResponse = supertest.Response
export interface TestRespBody {
  header: IncomingHttpHeaders
  url: string
  config: Config
  mwConfig: MiddlewareConfig
  cookies: unknown
}

export interface TestConfig {
  CI: boolean
  app: Application
  container: IMidwayContainer
  config: Config
  host: string
  httpRequest: SuperTest<supertest.Test>
  agent: TaskAgentService
  svc: TaskQueueService
  repo: TaskQueueRepository
  logRepo: TaskLogRepository
  retRepo: TaskResultRepository
  tm: ClientService
}
export const testConfig = {
  CI,
  config,
  host: '',
} as TestConfig

