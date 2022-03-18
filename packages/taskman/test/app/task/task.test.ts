import assert from 'assert/strict'
import { relative } from 'path'

import { sleep } from '@midwayjs/decorator'
import { testConfig } from 'test/root.config'

import { genCreateTaskDTO } from '../helper'

import {
  initTaskDTO,
  CreateTaskOptions,
  ServerMethod,
} from '~/lib/index'


const filename = relative(process.cwd(), __filename)

describe.skip(filename, () => {

  describe('should create() work', () => {
    it('normal', async () => {
      const { tm } = testConfig
      const createTaskDTO = genCreateTaskDTO()
      const opts: CreateTaskOptions = {
        headers: {
          auth: 'ooo',
        },
        createTaskDTO,
      }
      const task = await tm.create(opts)

      if (! task) {
        assert(false)
        return
      }
      assert(task.taskId)

      if (typeof task.timeoutIntv === 'object') {
        assert(
          task.timeoutIntv.hours === Number.parseInt(initTaskDTO.timeoutIntv as string),
          JSON.stringify(task),
        )
      }
      else {
        assert(false, JSON.stringify(task))
      }
    })
  })

  describe(`should ${ServerMethod.notifyRunning}() work`, () => {
    it('normal', async () => {
      const { tm } = testConfig
      const createTaskDTO = genCreateTaskDTO()
      const opts: CreateTaskOptions = {
        headers: {
          auth: 'ooo',
        },
        createTaskDTO,
      }
      const task = await tm.create(opts)

      if (! task) {
        assert(false)
        return
      }
      assert(task.taskId)

      tm.notifyRunning(task.taskId)
      await sleep(500)
      const progress = await tm.getProgress(task.taskId)
      assert(progress && progress.taskProgress === 0)
    })
  })

})
