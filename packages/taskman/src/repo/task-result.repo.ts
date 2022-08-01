import assert from 'node:assert'

import {
  App,
  Config,
  Init,
  Inject,
  Provide,
} from '@midwayjs/decorator'
import { Logger } from '@mw-components/jaeger'
import { DbSourceManager, Kmore } from '@mw-components/kmore'

import {
  DbModel,
  DbReplica,
  TaskServerConfig,
  ServerMethod,
  TaskResultDTO,
  TaskDTO,
  ConfigKey,
} from '../lib/index'

import { Application, Context } from '~/interface'


@Provide()
export class TaskResultRepository {

  @App() protected readonly app: Application

  @Inject() protected readonly ctx: Context

  @Inject() protected readonly logger: Logger

  @Config(ConfigKey.serverConfig) protected readonly serverConfig: TaskServerConfig

  @Inject() dbManager: DbSourceManager<DbReplica, DbModel, Context>

  public db: Kmore<DbModel, Context>

  @Init()
  async init(): Promise<void> {
    const db = this.dbManager.getDataSource(DbReplica.taskMaster)
    assert(db)
    this.db = db
  }

  // async [ServerMethod.destroy](): Promise<void> {
  //   await this.db.dbh.destroy()
  // }

  async [ServerMethod.create](input: TaskResultDTO): Promise<TaskResultDTO> {
    const { db } = this
    const ret = await db.camelTables.ref_tb_task_result(this.ctx)
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

  async [ServerMethod.read](taskId: TaskDTO['taskId']): Promise<TaskResultDTO | undefined> {
    const { db } = this
    const ret = await db.camelTables.ref_tb_task_result(this.ctx)
      .where('taskId', taskId)
      .limit(1)
      .then(arr => arr[0])

    return ret
  }

}

