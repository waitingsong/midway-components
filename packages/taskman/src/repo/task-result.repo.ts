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
  DbModel,
  DbReplica,
  DbReplicaKeys,
  TaskManServerConfig,
  ServerMethod,
  TaskResultDTO,
  TaskDTO,
} from '../lib/index'

import { genKmoreComponentConfig } from './helper'

import { Context } from '~/interface'


@Provide()
export class TaskResultRepository {

  @Inject() protected readonly ctx: Context

  @Inject('jaeger:logger') protected readonly logger: Logger

  @Config('taskManServerConfig') protected readonly serverConfig: TaskManServerConfig

  db: Kmore<DbModel>
  protected _dbManager: DbManager<DbReplicaKeys>

  @Init()
  async init(): Promise<void> {
    const kmoreConfig = genKmoreComponentConfig(this.serverConfig, initDbConfig)
    this._dbManager = await this.ctx.requestContext.getAsync(DbManager)
    // @ts-ignore for DecoratorManager not single
    this._dbManager.create(kmoreConfig, this.ctx.tracerManager, this.logger)
    const db = this._dbManager.getInstance<DbModel>(DbReplica.taskMaster)
    if (! db) {
      throw new Error(`Create db instance failed with DbId: "${DbReplica.taskMaster}"`)
    }
    this.db = db
  }

  async [ServerMethod.create](input: TaskResultDTO): Promise<TaskResultDTO> {
    const { db } = this
    const ret = await db.refTables.ref_tb_task_result()
      .insert(input)
      .returning('*')
      .then((arr) => {
        const [row] = arr
        if (! row) {
          throw new Error('insert failed')
        }
        return row
      })

    return ret as unknown as TaskResultDTO
  }


  async [ServerMethod.read](id: TaskDTO['taskId']): Promise<TaskResultDTO | undefined> {
    const { db } = this
    const ret = await db.refTables.ref_tb_task_result()
      .where('task_id', id)
      .limit(1)
      .then(arr => arr[0])

    return ret as unknown as TaskResultDTO
  }

}

