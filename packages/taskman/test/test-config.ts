import { IMidwayWebApplication } from '@midwayjs/web'

import {
  TaskLogRepository,
  TaskQueueRepository,
  TaskResultRepository,
} from '~/repo/index.repo'
import { TaskAgentService, TaskQueueService } from '~/service/index.service'


export interface TestConfig {
  app: IMidwayWebApplication
  agent: TaskAgentService
  svc: TaskQueueService
  repo: TaskQueueRepository
  logRepo: TaskLogRepository
  retRepo: TaskResultRepository
}
export const testConfig = {
} as TestConfig

