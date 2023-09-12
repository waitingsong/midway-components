
import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { createOneTask } from '../helper.js'

import { CreateTaskDTO } from '##/lib/index.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), () => {

  describe('should create() work', () => {
    it('normal', async () => {
      const { svc, repo, logRepo } = testConfig
      const task = await createOneTask(svc, repo)

      assert(task.taskTypeId === 1)
      assert(task.taskTypeVer === 1)
    })

    it('task_type_ver', async () => {
      const { svc, repo } = testConfig
      const input: Partial<CreateTaskDTO> = {
        taskTypeVer: 2,
      }
      const task = await createOneTask(svc, repo, input)
      assert(task.taskTypeVer === 2)
    })

    it('invalid task_type_id', async () => {
      const { svc, repo } = testConfig
      const input: Partial<CreateTaskDTO> = {
        taskTypeId: 999,
      }
      try {
        await createOneTask(svc, repo, input)
      }
      catch (ex) {
        assert(ex instanceof Error)
        assert(ex.message.includes('tb_task_task_type_id_fkey'))
        assert(ex.message.includes('violates foreign key constraint'))
        return
      }
      assert(false, 'Should throw error, but not')
    })
  })
})

