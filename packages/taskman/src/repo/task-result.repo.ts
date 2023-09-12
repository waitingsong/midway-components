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
  DbModel,
  DbReplica,
  TaskServerConfig,
  ServerMethod,
  TaskResultDTO,
  TaskDTO,
  ConfigKey,
} from '##/lib/index.js'


@Provide()
export class TaskResultRepository {

  @App() protected readonly app: Application

  // @Inject() protected readonly logger: Logger

  @Config(ConfigKey.serverConfig) protected readonly serverConfig: TaskServerConfig

  @Inject() dbManager: DbManager<DbReplica, DbModel, Context>

  db: Kmore<DbModel, Context>
  ref_tb_task_result: Kmore<DbModel, Context>['camelTables']['ref_tb_task_result']

  @Init()
  async init(): Promise<void> {
    const db = this.dbManager.getDataSource(DbReplica.taskMaster)
    assert(db)
    this.db = db
    this.ref_tb_task_result = db.camelTables.ref_tb_task_result
  }

  async [ServerMethod.create](input: TaskResultDTO): Promise<TaskResultDTO> {
    const ret = await this.ref_tb_task_result()
      .insert(input)
      .returning('*')
      .then(rows => rows[0])
      .then((row) => {
        if (! row) {
          throw new Error('insert failed')
        }
        return row
      })

    return ret
  }

  async [ServerMethod.read](taskId: TaskDTO['taskId']): Promise<TaskResultDTO | undefined> {
    const ret = await this.ref_tb_task_result()
      .where('taskId', taskId)
      .limit(1)
      .then(rows => rows[0])

    return ret
  }

}

