import assert from 'assert/strict'

import {
  CreateTaskDTO,
  TaskFullDTO,
  TaskDTO,
  initTaskDTO,
  ClientURL,
} from '##/lib/index.js'
import { TaskQueueRepository } from '##/repo/index.repo.js'
import { TaskQueueService } from '##/service/index.service.js'
import { testConfig } from '#@/root.config.js'


export async function createTasks(
  svc: TaskQueueService,
  repo: TaskQueueRepository,
  num: number,
  debug = false,
): Promise<TaskDTO[]> {

  const pms: Promise<TaskDTO>[] = []
  for (let i = 0; i < num; i += 1) {
    pms.push(createOneTask(svc, repo))
  }

  const ret = await Promise.all(pms)
  assert(ret && ret.length === num)
  if (debug) {
    console.info({ ret })
  }
  return ret
}


export function genCreateTaskDTO(
  input?: Partial<CreateTaskDTO>,
): CreateTaskDTO {

  const host = testConfig.host.endsWith('/')
    ? testConfig.host.slice(0, -1)
    : testConfig.host
  const dataUrl = `${host}${ClientURL.base}/${ClientURL.hello}`

  const data: CreateTaskDTO = {
    json: {
      url: dataUrl,
      method: 'GET',
      headers: {
        f1: 'user',
        f2: Math.random().toString(),
      },
    },
    taskTypeId: 1,
    ...input,
  }
  return data
}

export async function createOneTask(
  svc: TaskQueueService,
  repo: TaskQueueRepository,
  input?: Partial<CreateTaskDTO>,
): Promise<TaskDTO> {

  const data = genCreateTaskDTO(input)
  const task = await svc.create(data)
  valiateTask(task)

  const payload = await repo.db.camelTables.ref_tb_task_payload()
    .select('json')
    .where('taskId', task.taskId)
    .limit(1)
    .then(rows => rows[0])

  assert(payload && Object.keys(payload).length === 1)
  assert.deepStrictEqual(payload && payload.json, data.json)

  return task
}

export function valiateTask(task: TaskDTO): void {
  assert(Object.keys(task).length > 0)
  assert(typeof task.taskId === 'string' && task.taskId)
  const id = BigInt(task.taskId)
  assert(id > 0)

  assert(typeof (task as TaskFullDTO).json === 'undefined', JSON.stringify(task))

  assert(task.taskTypeId === 1)
  assert(task.taskState === initTaskDTO.taskState)
  assert(task.isTimeout === false, JSON.stringify(task))
  assert(task.startedAt === null, JSON.stringify(task))
  assert(task.expectStart instanceof Date, JSON.stringify(task))
  assert(task.ctime instanceof Date, JSON.stringify(task))
  assert(task.mtime === null, JSON.stringify(task))
}

export async function removeOneTask(
  repo: TaskQueueRepository,
  row: TaskDTO,
): Promise<void> {

  await repo.db.camelTables.ref_tb_task()
    .where('taskId', row.taskId)
    .delete()

  const ret = await repo.db.camelTables.ref_tb_task()
    .where('taskId', row.taskId)
  assert(ret.length === 0)

  const ret2 = await repo.db.camelTables.ref_tb_task_progress()
    .where('taskId', row.taskId)
  assert(ret2.length === 0)
}

export async function removeOneTaskPayload(
  repo: TaskQueueRepository,
  row: TaskDTO,
): Promise<void> {

  await repo.db.camelTables.ref_tb_task_payload()
    .where('taskId', row.taskId)
    .delete()

  const ret = await repo.db.camelTables.ref_tb_task_payload()
    .where('taskId', row.taskId)

  assert(ret.length === 0)
}

