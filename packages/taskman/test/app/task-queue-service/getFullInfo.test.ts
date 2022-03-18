import assert from 'assert/strict'
import { relative } from 'path'

import { testConfig } from 'test/root.config'

import { createOneTask } from '../helper'


const filename = relative(process.cwd(), __filename)

describe(filename, () => {

  describe('should getFullInfo() work', () => {
    it('normal', async () => {
      const { svc, repo } = testConfig
      const task = await createOneTask(svc, repo)
      const info = await svc.getFullInfo(task.taskId)
      assert(info && info.taskProgress === null)
    })

    it('progress changed', async () => {
      const { svc, repo } = testConfig
      const task = await createOneTask(svc, repo)
      const info = await svc.getFullInfo(task.taskId)
      assert(info && info.taskProgress === null)

      const { taskId } = task
      await svc.setRunning(taskId) // insert tb_task_progress

      const taskProgress = Math.round(Math.random() * 100)
      await svc.setProgress({ taskId, taskProgress })
      const info2 = await svc.getFullInfo(task.taskId)
      assert(info2 && info2.taskProgress === taskProgress)
    })

    it('progress not changed when less than current', async () => {
      const { svc, repo } = testConfig
      const task = await createOneTask(svc, repo)
      const info = await svc.getFullInfo(task.taskId)
      assert(info && info.taskProgress === null)

      const { taskId } = task
      await svc.setRunning(taskId) // insert tb_task_progress

      let taskProgress = Math.round(Math.random() * 100)
      if (taskProgress === 0) {
        taskProgress = 10
      }
      await svc.setProgress({ taskId, taskProgress })
      const info2 = await svc.getFullInfo(task.taskId)
      assert(info2 && info2.taskProgress === taskProgress)

      const info3 = await svc.setProgress({ taskId, taskProgress: 0 })
      assert(! info3)
    })
  })
})
