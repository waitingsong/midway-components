import assert from 'assert/strict'
import { relative } from 'path'

import { sleep } from '@waiting/shared-core'
import { testConfig } from 'test/root.config'

import { createOneTask } from '../helper'

import { apiPrefix, apiRoute } from '@/fixtures/base-app/src/api-route'
import { ClientURL, CreateTaskDTO, ServerURL, TaskAgentState, TaskDTO, TaskState } from '~/lib'


const filename = relative(process.cwd(), __filename)

describe(filename, () => {

  const path = `${apiPrefix.task}/${apiRoute.task1}`
  const pathStart = `${ClientURL.base}/${ClientURL.start}`
  const pathStop = `${ClientURL.base}/${ClientURL.stop}`
  const pathTaskGetInfo = `${ServerURL.base}/${ServerURL.getInfo}`

  describe(`should ${path} work`, () => {
    it('sendTaskToRun', async () => {
      const { svc, repo, httpRequest } = testConfig

      const host = testConfig.host.endsWith('/')
        ? testConfig.host.slice(0, -1)
        : testConfig.host

      const data: CreateTaskDTO = {
        json: {
          method: 'GET',
          url: `${host}${path}`,
          dataType: 'text',
        },
        taskTypeId: 1,
      }

      const task = await createOneTask(svc, repo, data)
      assert(task, 'should create task ok')

      const resp2 = await httpRequest.get(pathStart).expect(200)
      const status = resp2.body as TaskAgentState
      assert(status.isRunning, 'should running')

      let loop = 0
      let info: TaskDTO | undefined = void 0

      const pdata = {
        id: task.taskId,
      }
      while (loop < 10) {
        await sleep(2000)
        try {
          const resp3 = await httpRequest
            .get(pathTaskGetInfo)
            .query(pdata)
          // .expect(200) // may 204

          assert(resp3.ok === true)
          info = resp3.body as TaskDTO
          if (info && info.taskState === TaskState.succeeded) {
            return
          }
        }
        catch (ex) {
          console.error(ex)
          assert(false, 'fet error')
        }
        loop += 1
      }
      assert(info)
      assert(info.taskState === TaskState.succeeded, 'should taskState is succeeded')
    })
  })

})

