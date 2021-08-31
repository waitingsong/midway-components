import assert from 'assert/strict'
import { relative } from 'path'

import { testConfig } from 'test/root.config'

import { createOneTask } from '../helper'

import { InitTaskLogDTO } from '~/lib'



const filename = relative(process.cwd(), __filename)

describe(filename, () => {

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
      const taskId = Math.round(Math.random() * 1000).toString()
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

