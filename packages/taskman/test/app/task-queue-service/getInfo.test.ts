import assert from 'assert/strict'
import { relative } from 'path'

import { testConfig } from 'test/root.config'

import { createOneTask } from '../helper'


const filename = relative(process.cwd(), __filename)

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
