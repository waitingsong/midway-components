import { basename } from '@waiting/shared-core'
import { testConfig } from 'test/test-config'

import { createOneTask } from '../helper'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = basename(__filename)

describe(filename, () => {

  describe('should getInfo() work', () => {
    it('normal', async () => {
      const { svc, repo } = testConfig
      const task = await createOneTask(svc, repo)
      const info = await svc.getInfo(task.taskId)
      assert.deepStrictEqual(info, task)
    })
  })
})
