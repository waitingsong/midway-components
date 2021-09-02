import { relative } from 'path'

import { testConfig } from 'test/root.config'

import { createOneTask } from '../helper'

import { TaskState } from '~/lib'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = relative(process.cwd(), __filename)

describe(filename, () => {

  describe('should getProgress() work', () => {
    it('normal', async () => {
      const { svc, repo } = testConfig
      const task = await createOneTask(svc, repo)

      const { taskId } = task
      const info = await svc.getProgress(task.taskId)
      assert(info && info.taskState === TaskState.init)

      await svc.setRunning(taskId) // insert tb_task_progress

      let taskProgress = Math.round(Math.random() * 100)
      if (taskProgress === 0) {
        taskProgress = 1
      }
      await svc.setProgress({ taskId, taskProgress })
      const info2 = await svc.getProgress(task.taskId)
      assert(info2)
      assert(info2 && info2.taskId === task.taskId)
      assert(info2 && info2.taskProgress === taskProgress)
    })
  })
})

