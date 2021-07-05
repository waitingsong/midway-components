import { relative } from 'path'

import { testConfig } from 'test/test-config'

import { createOneTask } from '../helper'

import { ServerMethod, TaskState } from '~/lib/index'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = relative(process.cwd(), __filename)

describe(filename, () => {
  const method = ServerMethod.setFailed

  describe('should setFailed() work', () => {
    it('from init', async () => {
      const { svc, repo } = testConfig
      const task = await createOneTask(svc, repo)

      const { taskId } = task

      const ret = await svc[method](taskId)
      assert(ret && ret.taskState === TaskState.failed)
    })
    it('from pending', async () => {
      const { svc, repo } = testConfig
      const task = await createOneTask(svc, repo)

      const { taskId } = task
      const row = await svc.setState(taskId, TaskState.pending)
      assert(row)

      const ret = await svc[method](taskId)
      assert(ret && ret.taskState === TaskState.failed)
    })
    it('from running', async () => {
      const { svc, repo } = testConfig
      const task = await createOneTask(svc, repo)

      const { taskId } = task
      const row = await svc.setRunning(taskId) // insert tb_task_progress
      assert(row)

      const ret = await svc[method](taskId)
      assert(ret && ret.taskState === TaskState.failed)
    })
    it('from failed', async () => {
      const { svc, repo } = testConfig
      const task = await createOneTask(svc, repo)

      const { taskId } = task
      const row = await svc.setState(taskId, TaskState.failed)
      assert(row)

      const ret = await svc[method](taskId)
      assert(ret && ret.taskState === TaskState.failed)
    })

    it('no effect from cancelled', async () => {
      const { svc, repo } = testConfig
      const task = await createOneTask(svc, repo)

      const { taskId } = task
      const row = await svc.setState(taskId, TaskState.cancelled)
      assert(row)

      const ret = await svc[method](taskId)
      assert(! ret)
    })
    it('no effect from succeeded', async () => {
      const { svc, repo } = testConfig
      const task = await createOneTask(svc, repo)

      const { taskId } = task
      const row = await svc.setState(taskId, TaskState.succeeded)
      assert(row)

      const ret = await svc[method](taskId)
      assert(! ret)
    })
  })
})

