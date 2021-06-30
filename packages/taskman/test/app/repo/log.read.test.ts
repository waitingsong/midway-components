import { relative } from 'path'

import { testConfig } from 'test/test-config'

import { createOneTask } from '../helper'

import { InitTaskLogDTO } from '~/lib'


// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = relative(process.cwd(), __filename)

describe(filename, () => {

  describe('should read() work', () => {
    it('normal', async () => {
      const { svc, repo, logRepo } = testConfig
      const task = await createOneTask(svc, repo)

      const { taskId } = task
      const input: InitTaskLogDTO = {
        taskId,
        taskLogContent: Math.random().toString(),
        ctime: 'now()',
      }
      const log1 = await logRepo.create(input)
      const log2 = await logRepo.read(log1.taskLogId)
      assert.deepStrictEqual(log1, log2)
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
        const log2 = await logRepo.read(input.taskId)
        assert(! log2)
        return
      }
      assert(false, 'Should throw violates foreign key constraint "tb_task_log_task_id_fkey", but not')
    })
  })
})

