import { IncomingHttpHeaders } from 'node:http'

import type { Application, IMidwayContainer } from '@mwcp/share'
import supertest, { SuperTest } from 'supertest'

import { ClientService } from '~/index'
import {
  TaskLogRepository,
  TaskQueueRepository,
  TaskResultRepository,
} from '~/repo/index.repo'
import { TaskAgentService, TaskQueueService } from '~/service/index.service'


const CI = !! process.env['CI']
export type TestResponse = supertest.Response
export interface TestRespBody {
  header: IncomingHttpHeaders
  url: string
  cookies: unknown
}

export interface TestConfig {
  CI: boolean
  app: Application
  container: IMidwayContainer
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
  host: '',
} as TestConfig

