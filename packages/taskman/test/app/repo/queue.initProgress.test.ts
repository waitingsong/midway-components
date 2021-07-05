import { relative } from 'path'

import { testConfig } from 'test/test-config'

import { createOneTask } from '../helper'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = relative(process.cwd(), __filename)

describe(filename, () => {

  describe('should initProgress() work', () => {
    it('normal', async () => {
      const { svc, repo } = testConfig
      const task = await createOneTask(svc, repo)

      const { taskId } = task
      const info = await repo.initProgress(taskId)
      assert(info)
      assert(info && info.taskProgress === 0)
    })

    it('FK task_id', async () => {
      const { svc, repo } = testConfig
      await createOneTask(svc, repo)
      const taskId = Math.round(Math.random() * 1000).toString()
      try {
        await repo.initProgress(taskId)
      }
      catch (ex) {
        assert((ex as Error).message.includes('violates foreign key constraint'))
        assert((ex as Error).message.includes('tb_task_progress_task_id_fkey'))
        return
      }
      assert(false, 'Should throw violates foreign key constraint "tb_task_progress_task_id_fkey", but not')
    })
  })
})

