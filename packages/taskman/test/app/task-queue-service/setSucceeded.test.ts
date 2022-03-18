import assert from 'assert/strict'
import { relative } from 'path'

import { testConfig } from 'test/root.config'

import { createOneTask } from '../helper'

import { ServerMethod, TaskState } from '~/lib/index'


const filename = relative(process.cwd(), __filename)

describe(filename, () => {
  const method = ServerMethod.setSucceeded

  describe('should setSucceeded() work', () => {
    it('normal', async () => {
      const { svc, repo } = testConfig
      const task = await createOneTask(svc, repo)

      const { taskId } = task
      const row = await svc.setRunning(taskId) // insert tb_task_progress
      assert(row)

      const taskProgress = 10
      const info = await svc.setProgress({ taskId, taskProgress })
      assert(info && info.taskProgress === taskProgress)

      const ret = await svc[method](taskId)
      assert(ret && ret.taskState === TaskState.succeeded)
    })
  })
})

