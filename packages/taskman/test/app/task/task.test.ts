import { relative } from 'path'

import { sleep } from '@midwayjs/decorator'
import { testConfig } from 'test/root.config'

import { genCreateTaskDTO } from '../helper'

import {
  initTaskDTO,
  CreateTaskOptions,
  ServerMethod,
} from '~/lib/index'

// eslint-disable-next-line import/order
import assert = require('power-assert')


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
      if (typeof task.taskInfo.timeoutIntv === 'object') {
        assert(
          task.taskInfo.timeoutIntv.hours === Number.parseInt(initTaskDTO.timeoutIntv as string),
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
      const taskRunner = await tm.create(opts)

      if (! taskRunner) {
        assert(false)
        return
      }
      taskRunner.notifyRunning()
      await sleep(500)
      const prog = await taskRunner.getProgress()
      assert(prog && prog.taskProgress === 0)
    })
  })

})
