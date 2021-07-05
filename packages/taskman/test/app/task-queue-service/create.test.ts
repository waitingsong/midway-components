import { relative } from 'path'

import { testConfig } from 'test/test-config'

import { createOneTask } from '../helper'

import {
  initTaskDTO,
  CreateTaskDTO,
} from '~/lib/index'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = relative(process.cwd(), __filename)

describe(filename, () => {

  describe('should create() work', () => {
    it('normal', async () => {
      const { svc, repo } = testConfig
      const task = await createOneTask(svc, repo)

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

    it('custome', async () => {
      const { svc, repo } = testConfig
      const data: CreateTaskDTO = {
        expectStart: new Date(),
        timeoutIntv: '3min',
        json: {
          url: '/foo',
          method: 'GET',
          headers: {
            f1: 'a',
            f2: Math.random().toString(),
          },
        },
      }
      const task = await createOneTask(svc, repo, data)

      if (typeof task.timeoutIntv === 'object') {
        assert(
          task.timeoutIntv.minutes === Number.parseInt(data.timeoutIntv as string),
          JSON.stringify(task),
        )
      }
      else {
        assert(false, JSON.stringify(task))
      }
    })

  })
})
