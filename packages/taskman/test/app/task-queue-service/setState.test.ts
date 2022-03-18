import assert from 'assert/strict'
import { relative } from 'path'

import { testConfig } from 'test/root.config'

import { createOneTask } from '../helper'

import { TaskState } from '~/lib/index'


const filename = relative(process.cwd(), __filename)

describe(filename, () => {

  describe('should setState() work', () => {
    it('normal', async () => {
      const { svc, repo } = testConfig
      const task = await createOneTask(svc, repo)
      const state = TaskState.pending
      const info = await svc.setState(task.taskId, state)

      assert(info && info.taskState === state)
    })

    it('set progress to zero when set state to running', async () => {
      const { svc, repo } = testConfig
      const task = await createOneTask(svc, repo)
      const progress = await svc.getProgress(task.taskId)
        .then(row => row ? row.taskProgress : void 0)
      assert(typeof progress === 'undefined')

      const state = TaskState.running
      const info = await svc.setState(task.taskId, state)
      assert(info && info.taskState === state)
    })

    it('remove progress when set to succeeded', async () => {
      const { svc, repo } = testConfig
      const task = await createOneTask(svc, repo)
      const state = TaskState.succeeded
      const info = await svc.setState(task.taskId, state)
      assert(info && info.taskState === state)

      const progress = await svc.getProgress(task.taskId)
        .then(row => row ? row.taskProgress : void 0)
      assert(typeof progress === 'undefined')
    })
  })
})
