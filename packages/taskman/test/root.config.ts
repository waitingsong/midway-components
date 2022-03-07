import { IncomingHttpHeaders } from 'http'

import supertest, { SuperTest } from 'supertest'

import { Application } from '~/interface'
import { TaskManComponent } from '~/lib'
import {
  TaskLogRepository,
  TaskQueueRepository,
  TaskResultRepository,
} from '~/repo/index.repo'
import { TaskAgentService, TaskQueueService } from '~/service/index.service'


export type TestResponse = supertest.Response
export interface TestRespBody {
  cookies: unknown
  header: IncomingHttpHeaders
  url: string
  jwtOriginalErrorText: string
}

export interface TestConfig {
  /** host of test process */
  host: string
  app: Application
  httpRequest: SuperTest<supertest.Test>
  agent: TaskAgentService
  svc: TaskQueueService
  repo: TaskQueueRepository
  logRepo: TaskLogRepository
  retRepo: TaskResultRepository
  tm: TaskManComponent
}
export const testConfig = {
} as TestConfig

