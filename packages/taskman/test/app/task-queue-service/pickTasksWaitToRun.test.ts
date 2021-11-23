import { relative } from 'path'

import {
  bigIntMax,
  bigIntMin,
} from '@waiting/shared-core'
import { testConfig } from 'test/root.config'

import { createOneTask, createTasks } from '../helper'

import { CreateTaskDTO, TaskState } from '~/lib/index'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = relative(process.cwd(), __filename)

describe(filename, () => {

  describe('should pickTasksToRun() work', () => {
    it('normal', async () => {
      const { svc, repo } = testConfig
      const tasks = await createTasks(svc, repo, 1)
      const queues = await svc.pickTasksWaitToRun({ maxRows: 1 })

      assert(queues.length === 1)
      const [task] = queues
      if (! task) {
        assert(false)
        return
      }
      assert(tasks[0] && task.taskId === tasks[0].taskId)
      assert(task.taskState === TaskState.pending)
      assert(task.startedAt instanceof Date)
    })

    it('with will_start later', async () => {
      const { svc, repo } = testConfig
      const data: Partial<CreateTaskDTO> = {
        expectStart: new Date('3000-01-01'),
      }
      await createOneTask(svc, repo, data)
      const queues = await svc.pickTasksWaitToRun({ maxRows: 1 })
      assert(queues.length === 0)
    })

    it('maxRows ge', async () => {
      const { svc, repo } = testConfig
      await createTasks(svc, repo, 10)
      const queues = await svc.pickTasksWaitToRun({
        maxRows: 10,
      })
      assert(queues.length <= 10)
    })

    it('maxRows le', async () => {
      const { svc, repo } = testConfig
      await createTasks(svc, repo, 10)
      const queues = await svc.pickTasksWaitToRun({
        maxRows: 5,
      })
      assert(queues.length <= 5)
    })

    it('batch', async () => {
      const { svc, repo } = testConfig
      await createTasks(svc, repo, 10)
      const queues = await svc.pickTasksWaitToRun({
        maxRows: 2,
      })
      assert(queues.length === 2)
    })

    it('batch ASC', async () => {
      const { svc, repo } = testConfig
      const tasks = await createTasks(svc, repo, 10)
      const queues = await svc.pickTasksWaitToRun()
      const ids = tasks.map(row => BigInt(row.taskId))
      const maxTaskId = bigIntMax(...ids)
      const minTaskId = bigIntMin(...ids)
      assert(queues[0] && minTaskId.toString() === queues[0].taskId)

      const maxRow = await svc.getInfo(maxTaskId.toString())
      if (maxRow) {
        assert(maxRow.startedAt === null)
        assert(maxRow.taskState === TaskState.init)
      }
      else {
        assert(false)
      }
    })

    it.skip('batch DESC', async () => {
      const { svc, repo } = testConfig
      const tasks = await createTasks(svc, repo, 10)
      const queues = await svc.pickTasksWaitToRun({
        ord: 'DESC',
      })
      assert(tasks && tasks.length)
      assert(queues && queues.length)
      const ids = tasks.map(row => BigInt(row.taskId))
      assert(ids && ids.length)
      const maxTaskId = bigIntMax(...ids)
      const minTaskId = bigIntMin(...ids)
      assert(queues[0] && maxTaskId.toString() === queues[0].taskId)

      const minRow = await svc.getInfo(minTaskId.toString())
      if (minRow) {
        assert(minRow.startedAt === null)
        assert(minRow.taskState === TaskState.init)
      }
      else {
        assert(false)
      }
    })
  })
})

