import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { createOneTask } from '../helper.js'

import { ClientURL, PickInitTaskOptions, ServerURL, TaskDTO, TaskState } from '##/lib/index.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), () => {

  const path = `${ServerURL.base}/${ServerURL.pickTasksWaitToRun}`
  const pathStop = `${ClientURL.base}/${ClientURL.stop}`
  const pathClientHello = `${ClientURL.base}/${ClientURL.hello}`

  describe(`should ${path} work`, () => {
    it('taskTypeId exists', async () => {
      const { svc, repo, httpRequest } = testConfig

      await httpRequest.get(pathClientHello).expect(200)

      await httpRequest.get(pathStop).expect(200)

      const task = await createOneTask(svc, repo)
      assert(task, 'should create task ok')
      assert(task.taskTypeId === 1)
      assert(task.taskTypeVer === 1)

      await httpRequest.get(pathStop).expect(200)

      const data: Partial<PickInitTaskOptions> = {
        taskTypeId: 1,
        taskTypeVerList: '*',
      }
      const resp = await httpRequest
        .post(path)
        .send(data)
        .expect(200)

      // console.log(resp.body)
      const [row] = resp.body as TaskDTO[]
      assert(row, 'should get task ok')
      assert(row.taskTypeId === 1)
      assert(row.taskTypeVer === 1)
      assert(row.taskState === TaskState.pending)
    })

    it('taskTypeVerList exists', async () => {
      const { svc, repo, httpRequest } = testConfig

      await httpRequest.get(pathStop).expect(200)

      const task = await createOneTask(svc, repo)
      assert(task, 'should create task ok')
      assert(task.taskTypeId === 1)
      assert(task.taskTypeVer === 1)

      await httpRequest.get(pathStop).expect(200)

      const data: Partial<PickInitTaskOptions> = {
        taskTypeId: 1,
        taskTypeVerList: [1],
      }
      const resp = await httpRequest
        .post(path)
        .send(data)
        .expect(200)

      // console.log(resp.body)
      const [row] = resp.body as TaskDTO[]
      assert(row, 'should get task ok')
      assert(row.taskTypeId === 1)
      assert(row.taskTypeVer === 1)
      assert(row.taskState === TaskState.pending)
    })

    it('taskTypeVerList *', async () => {
      const { svc, repo, httpRequest } = testConfig

      await httpRequest.get(pathStop).expect(200)

      const task = await createOneTask(svc, repo)
      assert(task, 'should create task ok')
      assert(task.taskTypeId === 1)
      assert(task.taskTypeVer === 1)

      await httpRequest.get(pathStop).expect(200)

      const data: Partial<PickInitTaskOptions> = {
        taskTypeId: 1,
        taskTypeVerList: '*',
      }
      const resp = await httpRequest
        .post(path)
        .send(data)
        .expect(200)

      const [row] = resp.body as TaskDTO[]
      assert(row, 'should get task ok')
      assert(row.taskTypeId === 1)
      assert(row.taskTypeVer === 1)
      assert(row.taskState === TaskState.pending)
    })

    it('taskTypeVerList exists 2', async () => {
      const { svc, repo, httpRequest } = testConfig

      await httpRequest.get(pathStop).expect(200)

      const task = await createOneTask(svc, repo)
      assert(task, 'should create task ok')
      assert(task.taskTypeId === 1)
      assert(task.taskTypeVer === 1)

      await httpRequest.get(pathStop).expect(200)

      const data: Partial<PickInitTaskOptions> = {
        taskTypeId: 1,
        taskTypeVerList: [1, 2],
      }
      const resp = await httpRequest
        .post(path)
        .send(data)
        .expect(200)

      // console.log(resp.body)
      const [row] = resp.body as TaskDTO[]
      assert(row, 'should get task ok')
      assert(row.taskTypeId === 1)
      assert(row.taskTypeVer === 1)
      assert(row.taskState === TaskState.pending)
    })


    it('taskTypeId not exists', async () => {
      const { svc, repo, httpRequest } = testConfig

      await httpRequest.get(pathStop).expect(200)

      const task = await createOneTask(svc, repo)
      assert(task, 'should create task ok')
      assert(task.taskTypeId === 1)
      assert(task.taskTypeVer === 1)

      await httpRequest.get(pathStop).expect(200)

      const data: Partial<PickInitTaskOptions> = {
        taskTypeId: 9999,
        taskTypeVerList: '*',
      }
      const resp = await httpRequest
        .post(path)
        .send(data)
        .expect(200)

      const [row] = resp.body as TaskDTO[]
      assert(! row, 'should get task failed')
    })

    it('taskTypeVer not exists', async () => {
      const { svc, repo, httpRequest } = testConfig

      await httpRequest.get(pathStop).expect(200)

      const task = await createOneTask(svc, repo)
      assert(task, 'should create task ok')
      assert(task.taskTypeId === 1)
      assert(task.taskTypeVer === 1)

      await httpRequest.get(pathStop).expect(200)

      const data: Partial<PickInitTaskOptions> = {
        taskTypeId: 1,
        taskTypeVerList: [2],
      }
      const resp = await httpRequest
        .post(path)
        .type('form')
        .send(data)
        .expect(200)

      // console.log(resp.body)
      const [row] = resp.body as TaskDTO[]
      assert(! row, 'should get task failed')
    })

    it('taskTypeVer not exists 2', async () => {
      const { svc, repo, httpRequest } = testConfig

      await httpRequest.get(pathStop).expect(200)

      const task = await createOneTask(svc, repo)
      assert(task, 'should create task ok')
      assert(task.taskTypeId === 1)
      assert(task.taskTypeVer === 1)

      await httpRequest.get(pathStop).expect(200)

      const data: Partial<PickInitTaskOptions> = {
        taskTypeId: 1,
        taskTypeVerList: [0, 2],
      }
      const resp = await httpRequest
        .post(path)
        .type('form')
        .send(data)
        .expect(200)

      console.log(resp.body)
      const [row] = resp.body as TaskDTO[]
      assert(! row, 'should get task failed')
    })
  })

})

