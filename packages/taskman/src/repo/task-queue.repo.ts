import assert from 'node:assert'

import {
  App,
  Config,
  Init,
  Inject,
  Provide,
} from '@midwayjs/core'
import { DbManager, Kmore } from '@mwcp/kmore'
import type { Application, Context } from '@mwcp/share'

import {
  initTaskProgressDTO,
  DbModel,
  DbReplica,
  TaskDTO,
  TaskFullDTO,
  InitTaskDTO,
  TaskProgressDTO,
  TaskServerConfig,
  TbTaskProgressDO,
  TaskPayloadDTO,
  PickInitTaskOptions,
  TaskState,
  TaskStatistics,
  initTaskStatistics,
  SetProgressDTO,
  ServerMethod,
  TaskProgressDetailDTO,
  ConfigKey,
} from '##/lib/index.js'


@Provide()
export class TaskQueueRepository {

  @App() protected readonly app: Application

  @Config(ConfigKey.serverConfig) protected readonly serverConfig: TaskServerConfig

  @Inject() dbManager: DbManager<DbReplica, DbModel, Context>

  db: Kmore<DbModel, Context>
  ref_tb_task: Kmore<DbModel, Context>['camelTables']['ref_tb_task']

  @Init()
  async init(): Promise<void> {
    const db = this.dbManager.getDataSource(DbReplica.taskMaster)
    assert(db)
    this.db = db
    this.ref_tb_task = db.camelTables.ref_tb_task
  }

  async [ServerMethod.create](input: InitTaskDTO): Promise<TaskDTO> {
    const ret = await this.ref_tb_task()
      .insert(input)
      .returning('*')
      .then((arr) => {
        const [row] = arr
        if (! row) {
          throw new Error('insert failed')
        }
        return row
      })

    return ret
  }

  /**
   * insert into tb_task_payload
   */
  async addTaskPayload(input: TaskPayloadDTO): Promise<TaskPayloadDTO> {
    const { db } = this
    const ret = await db.camelTables.ref_tb_task_payload()
      .insert(input)
      .returning('*')
      .then((arr) => {
        const [row] = arr
        if (! row) {
          throw new Error('insert failed')
        }
        return row
      })

    return ret as unknown as TaskPayloadDTO
  }

  async getInfo(taskId: TaskDTO['taskId']): Promise<TaskDTO | undefined> {
    const ret = await this.ref_tb_task()
      .select('*')
      .where({ taskId })
      .limit(1)
      .then(arr => arr[0])

    return ret
  }

  async [ServerMethod.getProgress](
    taskId: TaskDTO['taskId'],
  ): Promise<TaskProgressDetailDTO | undefined> {

    const { db } = this
    const task = await this.ref_tb_task()
      .select('taskState')
      .where({ taskId })
      .limit(1)
      .then(arr => arr[0])
    if (! task) { return }

    const prog = await db.camelTables.ref_tb_task_progress()
      .where({ taskId })
      .limit(1)
      .then(arr => arr[0])

    if (prog) {
      const ret: TaskProgressDetailDTO = {
        ...prog,
        taskState: task.taskState,
      }

      assert(typeof ret.taskProgress !== 'undefined', 'taskProgress should not be undefined')
      assert(ret.taskProgress >= 0 && ret.taskProgress <= 100)
      return ret
    }
    const ret: TaskProgressDetailDTO = {
      taskId,
      taskState: task.taskState,
      taskProgress: 0,
    }

    assert(typeof ret.taskProgress !== 'undefined', 'taskProgress should not be undefined')
    assert(ret.taskProgress >= 0 && ret.taskProgress <= 100)
    return ret
  }

  async setState(
    taskId: TaskDTO['taskId'],
    taskState: TaskDTO['taskState'],
  ): Promise<TaskDTO | undefined> {

    const ret = await this.ref_tb_task()
      .update({ taskState })
      .update('mtime', 'now()')
      .where({ taskId })
      .returning('*')
      .then(arr => arr[0])

    return ret as unknown as TaskDTO
  }

  /**
   * insert progress and set progress 0, FK constraint
   */
  async initProgress(
    taskId: TaskDTO['taskId'],
  ): Promise<TaskProgressDTO | undefined> {

    const { db } = this
    const trx = await db.transaction()

    await db.camelTables.ref_tb_task_progress()
      .transacting(trx)
      .forUpdate()
      .where({ taskId })
      .del()
      .catch(async (ex) => {
        await trx.rollback()
        throw ex
      })

    const data: TaskProgressDTO = {
      ...initTaskProgressDTO,
      taskId,
      taskProgress: 0,
    }

    const ins = await db.camelTables.ref_tb_task_progress()
      .transacting(trx)
      .forUpdate()
      .insert(data)
      .returning('*')
      .then(async (rows) => {
        return rows.length ? rows[0] : void 0
      })
      .catch(async (ex) => {
        await trx.rollback()
        throw ex
      })

    await trx.commit()
    return ins
  }

  /**
   * only when pending or init
   */
  async [ServerMethod.setRunning](
    taskId: TaskDTO['taskId'],
  ): Promise<TaskDTO | undefined> {

    const ret = await this.ref_tb_task()
      .update('taskState', TaskState.running)
      .update('mtime', 'now()')
      .where({ taskId })
      .whereIn('taskState', [TaskState.pending, TaskState.init])
      .returning('*')
      .then(rows => rows[0])

    return ret
  }


  /**
   * Not in state succeeded, cancelled
   */
  async [ServerMethod.setFailed](
    taskId: TaskDTO['taskId'],
  ): Promise<TaskDTO | undefined> {

    const whereState = [
      TaskState.succeeded,
      TaskState.cancelled,
    ]
    const ret = await this.ref_tb_task()
      .update('taskState', TaskState.failed)
      .update('mtime', 'now()')
      .where({ taskId })
      .whereNotIn('taskState', whereState)
      .returning('*')
      .then(rows => rows[0])

    return ret
  }

  /**
   * only in init, pending, running, cancelled
   */
  async [ServerMethod.setCancelled](
    taskId: TaskDTO['taskId'],
  ): Promise<TaskDTO | undefined> {

    const whereState = [
      TaskState.init,
      TaskState.pending,
      TaskState.running,
      TaskState.cancelled,
    ]
    const ret = await this.ref_tb_task()
      .update('taskState', TaskState.cancelled)
      .update('mtime', 'now()')
      .where({ taskId })
      .whereIn('taskState', whereState)
      .returning('*')
      .then(rows => rows[0])

    return ret
  }

  /**
   * only when running
   */
  async [ServerMethod.setSucceeded](
    taskId: TaskDTO['taskId'],
  ): Promise<TaskDTO | undefined> {

    const { db } = this
    const trx = await db.transaction()

    const status = await this.getProgress(taskId)
    if (! status || status.taskState === TaskState.pending) {
      await this.initProgress(taskId)
      await this.setRunning(taskId)
    }

    await db.camelTables.ref_tb_task_progress()
      .transacting(trx)
      .forUpdate()
      .update('taskProgress', 100)
      .update('mtime', 'now()')
      .where({ taskId })
      .returning('*')
      .catch(async (ex) => {
        await trx.rollback()
        throw ex
      })

    const ret = await this.ref_tb_task()
      .transacting(trx)
      .forUpdate()
      .update('taskState', TaskState.succeeded)
      .update('mtime', 'now()')
      .where({ taskId })
      .where('taskState', TaskState.running)
      .returning('*')
      .then(rows => rows[0])
      .catch(async (ex) => {
        await trx.rollback()
        throw ex
      })

    await trx.commit()
    return ret
  }


  /**
   * @description task must in state pending
   */
  async [ServerMethod.setProgress](
    options: SetProgressDTO,
  ): Promise<TaskProgressDTO | undefined> {

    const { db } = this
    const { taskId, taskProgress } = options
    const ret = await db.camelTables.ref_tb_task_progress()
      .update('taskProgress', taskProgress)
      .update('mtime', 'now()')
      .where({ taskId })
      .where('taskProgress', '<=', taskProgress)
      .limit(1)
      .returning('*')
      .then(rows => rows[0])

    return ret
  }

  async getFullInfo(id: TaskDTO['taskId']): Promise<TaskFullDTO | undefined> {
    const { db } = this
    const { tables, scoped, camelAlias } = db.dict

    const cols = [
      // tb_task 所有字段
      ...Object.values(camelAlias.tb_task),
      // tb_task_progress 指定字段
      camelAlias.tb_task_progress.task_progress,
    ]
    const ret = await this.ref_tb_task()
      .leftJoin<TbTaskProgressDO>(
      tables.tb_task_progress,
      scoped.tb_task.task_id,
      scoped.tb_task_progress.task_id,
    )
      .where(scoped.tb_task.task_id, id)
      .columns(cols)
      .limit(1)
      .then(arr => arr[0])

    // @FIXME
    return ret as unknown as TaskFullDTO
  }

  /**
   * maxRows: 100
   */
  async getPayloads(ids: TaskDTO['taskId'][]): Promise<TaskPayloadDTO[]> {
    const { db } = this

    const ret = await db.camelTables.ref_tb_task_payload()
      .select()
      .whereIn('taskId', ids.slice(0, 100))

    return ret
  }

  async removeProgress(ids: TaskDTO['taskId'][]): Promise<number> {
    const { db } = this
    const ret = db.camelTables.ref_tb_task_progress()
      .whereIn('taskId', ids)
      .del()
    return ret
  }


  async pickInitTasksToPending(options: PickInitTaskOptions): Promise<TaskDTO[]> {
    const { db } = this

    assert(options.taskTypeId > 0, 'taskTypeId must > 0')

    const trx = await db.transaction()

    const where = `expect_start BETWEEN now() - interval '${options.earlierThanTimeIntv}'
      AND now() + interval '1s'`

    let query = this.ref_tb_task()
      .transacting(trx)
      .forUpdate()
      .select('taskId')
      .where('taskState', TaskState.init)
      .where('taskTypeId', options.taskTypeId)
      .whereRaw(where)
      .limit(options.maxRows)
      .orderBy('expectStart', options.ord)
      .orderBy('ctime', options.ord)
      .orderBy('taskId', options.ord)

    if (options.taskTypeVerList !== '*' && options.taskTypeVerList.length) {
      query = query.whereIn('taskTypeVer', options.taskTypeVerList)
    }

    const tasks = await query
      .catch(async (ex) => {
        await trx.rollback()
        throw ex
      })

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (! tasks?.length) {
      await trx.rollback() // !
      return []
    }

    const ids = tasks.map(row => row.taskId)
    const ret = await this.ref_tb_task()
      .transacting(trx)
      .update('taskState', TaskState.pending)
      .update('startedAt', 'now()')
      .update('mtime', 'now()')
      .where('taskState', TaskState.init)
      .whereRaw(where)
      .whereIn('taskId', ids)
      .returning('*')
      .catch(async (ex) => {
        await trx.rollback()
        throw ex
      })
      // .toQuery()

    await trx.commit()
    return ret
  }

  async [ServerMethod.stats](): Promise<TaskStatistics> {
    const { db } = this
    const ret: TaskStatistics = {
      ...initTaskStatistics,
    }

    const info: StatsRow[] = await db.camelTables.ref_vi_task()
      .count('taskState')
      .select('taskState')
      .groupBy('taskState')

    info.forEach((row) => {
      const { count, taskState } = row
      ret[taskState] = +count
    })

    return ret
  }

  async assertsTaskExists(id: TaskDTO['taskId']): Promise<TaskDTO | undefined> {
    const ret = await this.ref_tb_task()
      .where('taskId', id)
      .first()
    return ret
    // assert(ret, `task not exists: ${id}`)
  }

}

interface StatsRow {
  count: string
  taskState: TaskState
}
