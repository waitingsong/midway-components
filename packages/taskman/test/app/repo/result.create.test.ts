import assert from 'assert/strict'
import { relative } from 'path'

import { testConfig } from 'test/root.config'

import { createOneTask } from '../helper'

import { TaskResultDTO } from '~/lib'


const filename = relative(process.cwd(), __filename)

describe(filename, () => {

  describe('should create() work', () => {
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
      const ret = await retRepo.create(input)
      assert(ret)
      assert.deepStrictEqual(ret.json, input.json)
    })

    it('FK task_id', async () => {
      const { retRepo } = testConfig
      const taskId = Math.round(Math.random() * 1000).toString()
      const input: TaskResultDTO = {
        taskId,
        json: {
          foo: Math.random().toString(),
        },
        ctime: 'now()',
      }
      try {
        await retRepo.create(input)
      }
      catch (ex) {
        assert((ex as Error).message.includes('violates foreign key constraint'))
        assert((ex as Error).message.includes('tb_task_result_task_id_fkey'))
        return
      }
      assert(false, 'Should throw violates foreign key constraint "tb_task_result_task_id_fkey", but not')
    })
  })
})

