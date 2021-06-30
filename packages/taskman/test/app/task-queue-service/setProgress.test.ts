import { relative } from 'path'

import { testConfig } from 'test/test-config'

import { createOneTask } from '../helper'

// eslint-disable-next-line import/order
import assert = require('power-assert')


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
      const info = await svc.setProgress({ taskId: '99999999', taskProgress: 0 })
      assert(! info) // must setRunning() first
    })

  })
})

