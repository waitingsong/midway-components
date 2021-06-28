import { IMidwayWebApplication } from '@midwayjs/web'

import { TaskQueueRepository } from '~/repo/index.repo'
import { TaskAgentService, TaskQueueService } from '~/service/index.service'


export interface TestConfig {
  app: IMidwayWebApplication
  agent: TaskAgentService
  svc: TaskQueueService
  repo: TaskQueueRepository
}
export const testConfig = {
} as TestConfig

