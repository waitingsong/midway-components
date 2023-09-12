import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { createOneTask } from '../helper.js'

import { InitTaskLogDTO } from '##/lib/index.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), () => {

  describe('should create() work', () => {
    it('normal', async () => {
      const { svc, repo, logRepo } = testConfig
      const task = await createOneTask(svc, repo)

      const { taskId } = task
      const input: InitTaskLogDTO = {
        taskId,
        taskLogContent: Math.random().toString(),
        ctime: 'now()',
      }
      const log = await logRepo.create(input)
      assert(log)
      assert(log && log.taskLogContent === input.taskLogContent)
    })

    it('FK task_id', async () => {
      const { logRepo } = testConfig
      const taskId = (Math.round(Math.random() * 100000) * 1000).toString()
      const input: InitTaskLogDTO = {
        taskId,
        taskLogContent: Math.random().toString(),
        ctime: 'now()',
      }
      try {
        await logRepo.create(input)
      }
      catch (ex) {
        assert((ex as Error).message.includes('violates foreign key constraint'))
        assert((ex as Error).message.includes('tb_task_log_task_id_fkey'))
        return
      }
      assert(false, 'Should throw violates foreign key constraint "tb_task_log_task_id_fkey", but not')
    })
  })
})

