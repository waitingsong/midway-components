import { IMidwayWebApplication } from '@midwayjs/web'
import supertest, { SuperTest } from 'supertest'

import { TaskManComponent } from '~/lib'
import {
  TaskLogRepository,
  TaskQueueRepository,
  TaskResultRepository,
} from '~/repo/index.repo'
import { TaskAgentService, TaskQueueService } from '~/service/index.service'


export interface TestConfig {
  /** host of test process */
  host: string
  app: IMidwayWebApplication
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

