import { IMidwayWebApplication } from '@midwayjs/web'

import { TaskLogRepository, TaskQueueRepository } from '~/repo/index.repo'
import { TaskAgentService, TaskQueueService } from '~/service/index.service'


export interface TestConfig {
  app: IMidwayWebApplication
  agent: TaskAgentService
  svc: TaskQueueService
  repo: TaskQueueRepository
  logRepo: TaskLogRepository
}
export const testConfig = {
} as TestConfig

