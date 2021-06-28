import {
  Config,
  Init,
  Inject,
  Provide,
} from '@midwayjs/decorator'
import { Logger } from '@mw-components/jaeger'
import {
  DbManager,
  Kmore,
} from '@mw-components/kmore'

import {
  initDbConfig,
  initTaskProgressDTO,
  DbModel,
  DbReplica,
  DbReplicaKeys,
  TaskDTO,
  TaskFullDTO,
  InitTaskDTO,
  TaskProgressDTO,
  TaskManServerConfig,
  TbTaskProgressDO,
  TaskPayloadDTO,
  PickInitTaskOptions,
  TaskState,
  TaskStatistics,
  initTaskStatistics,
  SetProgressDTO,
  ServerMethod,
} from '../lib/index'

import { genKmoreComponentConfig } from './helper'

import { Context } from '~/interface'


@Provide()
export class TaskQueueRepository {

  @Inject() protected readonly ctx: Context

  @Inject('jaeger:logger') protected readonly logger: Logger

  @Config('taskManServerConfig') protected readonly serverConfig: TaskManServerConfig

  db: Kmore<DbModel>
  protected _dbManager: DbManager<DbReplicaKeys>

  @Init()
  async init(): Promise<void> {
    const kmoreConfig = genKmoreComponentConfig(this.serverConfig, initDbConfig)
    this._dbManager = await this.ctx.requestContext.getAsync(DbManager)
    this._dbManager.create(kmoreConfig, this.ctx.tracerManager, this.logger)
    const db = this._dbManager.getInstance<DbModel>(DbReplica.taskMaster)
    if (! db) {
      throw new Error(`Create db instance failed with DbId: "${DbReplica.taskMaster}"`)
    }
    this.db = db
  }

  async [ServerMethod.create](input: InitTaskDTO): Promise<TaskDTO> {
    const { db } = this
    const ret = await db.refTables.ref_tb_task()
      .insert(input)
      .returning('*')
      .then((arr) => {
        const [row] = arr
        if (! row) {
          throw new Error('insert failed')
        }
        return row
      })

    return ret as unknown as TaskDTO
  }

  async addTaskPayload(input: TaskPayloadDTO): Promise<TaskPayloadDTO> {
    const { db } = this
    const ret = await db.refTables.ref_tb_task_payload()
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

  async getInfo(id: TaskDTO['taskId']): Promise<TaskDTO | undefined> {
    const { db } = this
    const ret = await db.refTables.ref_tb_task()
      .select('*')
      .where('task_id', id)
      .limit(1)
      .then(arr => arr[0])

    return ret as unknown as TaskDTO
  }

  async [ServerMethod.getProgress](id: TaskDTO['taskId']): Promise<TaskProgressDTO | undefined> {
    const { db } = this
    const ret = await db.refTables.ref_tb_task_progress()
      .where('task_id', id)
      .limit(1)
      .then(arr => arr[0])

    return ret as unknown as TaskProgressDTO
  }

  async setState(
    id: TaskDTO['taskId'],
    taskState: TaskDTO['taskState'],
  ): Promise<TaskDTO | undefined> {

    const { db } = this
    const ret = await db.refTables.ref_tb_task()
      .update('task_state', taskState)
      .where('task_id', id)
      .returning('*')
      .then(arr => arr[0])

    return ret as unknown as TaskDTO
  }

  /**
   * insert progress and set progress 0, FK constraint
   */
  async initProgress(
    id: TaskDTO['taskId'],
  ): Promise<TaskProgressDTO | undefined> {

    const { db } = this
    const trx = await db.dbh.transaction()

    await db.refTables.ref_tb_task_progress()
      .transacting(trx)
      .forUpdate()
      .where('task_id', id)
      .del()

    const data: TaskProgressDTO = {
      ...initTaskProgressDTO,
      taskId: id,
      taskProgress: 0,
    }

    const ins = await db.refTables.ref_tb_task_progress()
      .transacting(trx)
      .forUpdate()
      .insert(data)
      .returning('*')
      .then(async (rows) => {
        await trx.commit()
        return rows.length ? rows[0] : void 0
      })

    return ins as unknown as TaskProgressDTO
  }

  /**
   * only when pending or init
   */
  async [ServerMethod.setRunning](
    id: TaskDTO['taskId'],
  ): Promise<TaskDTO | undefined> {

    const { db } = this
    const ret = await db.refTables.ref_tb_task()
      .update('task_state', TaskState.running)
      .where('task_id', id)
      .whereIn('task_state', [TaskState.pending, TaskState.init])
      .returning('*')

    return ret as unknown as TaskDTO | undefined
  }


  /**
   * Not in state succeeded, cancelled
   */
  async [ServerMethod.setFailed](
    id: TaskDTO['taskId'],
  ): Promise<TaskDTO | undefined> {

    const { db } = this

    const whereState = [
      TaskState.succeeded,
      TaskState.cancelled,
    ]
    const ret = await db.refTables.ref_tb_task()
      .update('task_state', TaskState.failed)
      .where('task_id', id)
      .whereNotIn('task_state', whereState)
      .returning('*')
      .then((rows) => {
        return rows.length ? rows[0] : void 0
      })

    return ret as unknown as TaskDTO
  }

  /**
   * only in init, pending, running, cancelled
   */
  async [ServerMethod.setCancelled](
    id: TaskDTO['taskId'],
  ): Promise<TaskDTO | undefined> {

    const { db } = this

    const whereState = [
      TaskState.init,
      TaskState.pending,
      TaskState.running,
      TaskState.cancelled,
    ]
    const ret = await db.refTables.ref_tb_task()
      .update('task_state', TaskState.cancelled)
      .where('task_id', id)
      .whereIn('task_state', whereState)
      .returning('*')
      .then((rows) => {
        return rows.length ? rows[0] : void 0
      })

    return ret as unknown as TaskDTO
  }

  /**
   * only when running
   */
  async [ServerMethod.setSucceeded](
    id: TaskDTO['taskId'],
  ): Promise<TaskDTO | undefined> {

    const { db } = this
    const trx = await db.dbh.transaction()

    await db.refTables.ref_tb_task_progress()
      .transacting(trx)
      .forUpdate()
      .update('task_progress', 100)
      .where('task_id', id)

    const ret = await db.refTables.ref_tb_task()
      .transacting(trx)
      .forUpdate()
      .update('task_state', TaskState.succeeded)
      .where('task_id', id)
      .where('task_state', TaskState.running)
      .returning('*')
      .then(async (rows) => {
        await trx.commit()
        return rows.length ? rows[0] : void 0
      })

    return ret as unknown as TaskDTO
  }


  /**
   * @description task must in state pending
   */
  async [ServerMethod.setProgress](
    options: SetProgressDTO,
  ): Promise<TaskProgressDTO | undefined> {

    const { db } = this
    const { taskId, taskProgress } = options
    const ret = await db.refTables.ref_tb_task_progress()
      .update('task_progress', taskProgress)
      .where('task_id', taskId)
      .where('task_progress', '<=', taskProgress)
      .limit(1)
      .returning('*')
      .then(rows => rows[0])

    return ret as unknown as TaskProgressDTO
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
    const ret = await db.refTables.ref_tb_task()
      .leftJoin<TbTaskProgressDO>(
      tables.tb_task_progress,
      scoped.tb_task.task_id,
      scoped.tb_task_progress.task_id,
    )
      .where(scoped.tb_task.task_id, id)
      .columns(cols)
      .limit(1)
      .then(arr => arr[0])

    return ret as unknown as TaskFullDTO
  }

  /**
   * maxRows: 100
   */
  async getPayloads(ids: TaskDTO['taskId'][]): Promise<TaskPayloadDTO[]> {
    const { db } = this

    const ret = await db.refTables.ref_tb_task_payload()
      .select()
      .whereIn('task_id', ids.slice(0, 100))

    return ret as unknown as TaskPayloadDTO[]
  }

  async removeProgress(ids: TaskDTO['taskId'][]): Promise<number> {
    const { db } = this
    const ret = db.refTables.ref_tb_task_progress()
      .whereIn('task_id', ids)
      .del()
    return ret
  }


  async pickInitTasksToPending(options: PickInitTaskOptions): Promise<TaskDTO[]> {
    const { db } = this
    const trx = await db.dbh.transaction()

    const tasks = await db.refTables.ref_tb_task()
      .transacting(trx)
      .forUpdate()
      .select('task_id')
      .where('task_state', TaskState.init)
      .whereRaw(`will_start BETWEEN now() - interval '${options.earlierThanTimeIntv}' AND now()`)
      .limit(options.maxRows)
      .orderBy('ctime', options.ord)
      .orderBy('task_id', options.ord)

    if (! tasks.length) {
      await trx.rollback() // !
      return []
    }

    const ids = tasks.map(row => (row as unknown as TaskDTO).taskId)
    const ret = await db.refTables.ref_tb_task()
      .transacting(trx)
      .update('task_state', TaskState.pending)
      .update('started_at', 'now()')
      .where('task_state', TaskState.init)
      .whereRaw(`will_start BETWEEN now() - interval '${options.earlierThanTimeIntv}' AND now()`)
      .whereIn('task_id', ids)
      .returning('*')
      .then(async (rows) => {
        await trx.commit()
        return rows
      })
      // .toQuery()

    return ret as unknown as TaskDTO[]
  }

  async [ServerMethod.stats](): Promise<TaskStatistics> {
    const { db } = this
    const ret: TaskStatistics = {
      ...initTaskStatistics,
    }

    const info = await db.refTables.ref_vi_task()
      .count('task_state')
      .select('task_state')
      .groupBy('task_state') as StatsRow[]

    info.forEach((row) => {
      const { count, taskState } = row
      ret[taskState] = +count
    })

    return ret
  }

}

interface StatsRow {
  count: string
  taskState: TaskState
}
