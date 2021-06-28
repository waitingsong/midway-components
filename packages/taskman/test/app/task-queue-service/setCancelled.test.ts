import { basename } from '@waiting/shared-core'
import { testConfig } from 'test/test-config'

import { createOneTask } from '../helper'

import { ServerMethod, TaskState } from '~/lib/index'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = basename(__filename)

describe(filename, () => {
  const method = ServerMethod.setCancelled

  describe('should setCancelled() work', () => {
    it('from init', async () => {
      const { svc, repo } = testConfig
      const task = await createOneTask(svc, repo)

      const { taskId } = task

      const ret = await svc[method](taskId)
      assert(ret && ret.taskState === TaskState.cancelled)
    })
    it('from pending', async () => {
      const { svc, repo } = testConfig
      const task = await createOneTask(svc, repo)

      const { taskId } = task
      const row = await svc.setState(taskId, TaskState.pending)
      assert(row)

      const ret = await svc[method](taskId)
      assert(ret && ret.taskState === TaskState.cancelled)
    })
    it('from running', async () => {
      const { svc, repo } = testConfig
      const task = await createOneTask(svc, repo)

      const { taskId } = task
      const row = await svc.setRunning(taskId) // insert tb_task_progress
      assert(row)

      const ret = await svc[method](taskId)
      assert(ret && ret.taskState === TaskState.cancelled)
    })
    it('from cancelled', async () => {
      const { svc, repo } = testConfig
      const task = await createOneTask(svc, repo)

      const { taskId } = task
      const row = await svc.setState(taskId, TaskState.cancelled)
      assert(row)

      const ret = await svc[method](taskId)
      assert(ret && ret.taskState === TaskState.cancelled)
    })

    it('no effect from suspended', async () => {
      const { svc, repo } = testConfig
      const task = await createOneTask(svc, repo)

      const { taskId } = task
      const row = await svc.setState(taskId, TaskState.suspended)
      assert(row)

      const ret = await svc[method](taskId)
      assert(! ret)
    })
    it('no effect from failed', async () => {
      const { svc, repo } = testConfig
      const task = await createOneTask(svc, repo)

      const { taskId } = task
      const row = await svc.setState(taskId, TaskState.failed)
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

