import assert from 'assert/strict'
import { relative } from 'path'

import { testConfig } from 'test/root.config'

import { createOneTask } from '../helper'


const filename = relative(process.cwd(), __filename)

describe(filename, () => {

  describe('should setProgress() work', () => {
    it('normal', async () => {
      const { svc, repo } = testConfig
      const task = await createOneTask(svc, repo)

      const { taskId } = task
      let taskProgress = 55
      let info = await svc.setProgress({ taskId, taskProgress })
      assert(! info)

      await svc.setRunning(taskId) // insert tb_task_progress
      info = await svc.setProgress({ taskId, taskProgress })
      assert(info && info.taskProgress === taskProgress)

      taskProgress = 56
      info = await repo.setProgress({ taskId, taskProgress })
      assert(info && info.taskProgress === taskProgress)

      taskProgress = 55
      info = await repo.setProgress({ taskId, taskProgress })
      assert(! info)
    })


    it('empty', async () => {
      const { svc } = testConfig
      const taskId = Math.round(Math.random() * 1000).toString()
      const info = await svc.setProgress({ taskId, taskProgress: 0 })
      assert(! info) // must setRunning() first
    })

  })
})

