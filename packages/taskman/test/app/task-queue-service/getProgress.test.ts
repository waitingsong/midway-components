import { basename } from '@waiting/shared-core'
import { testConfig } from 'test/test-config'

import { createOneTask } from '../helper'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = basename(__filename)

describe(filename, () => {

  describe('should getProgress() work', () => {
    it('normal', async () => {
      const { svc, repo } = testConfig
      const task = await createOneTask(svc, repo)

      const { taskId } = task
      const info = await svc.getProgress(task.taskId)
      assert(! info)

      await svc.setRunning(taskId) // insert tb_task_progress

      const taskProgress = Math.round(Math.random() * 100)
      await svc.setProgress({ taskId, taskProgress })
      const info2 = await svc.getProgress(task.taskId)
      assert(info2)
      assert(info2 && info2.taskId === task.taskId)
      assert(info2 && info2.taskProgress === taskProgress)
    })
  })
})

