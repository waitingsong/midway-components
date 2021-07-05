import { relative } from 'path'

import { testConfig } from 'test/test-config'

import { createOneTask } from '../helper'

import { TaskResultDTO } from '~/lib'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = relative(process.cwd(), __filename)

describe(filename, () => {

  describe('should read() work', () => {
    it('normal', async () => {
      const { svc, repo, retRepo } = testConfig
      const task = await createOneTask(svc, repo)

      const { taskId } = task
      const input: TaskResultDTO = {
        taskId,
        json: {
          taskId,
          foo: Math.random().toString(),
        },
        ctime: 'now()',
      }
      const ret1 = await retRepo.create(input)
      const ret2 = await retRepo.read(ret1.taskId)
      assert.deepStrictEqual(ret1, ret2)
    })
  })
})

