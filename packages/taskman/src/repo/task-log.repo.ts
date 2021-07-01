import {
  App,
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
  InitTaskLogDTO,
  TaskManServerConfig,
  ServerMethod,
  TaskLogDTO,
} from '../lib/index'

import { genKmoreComponentConfig } from './helper'

import { Application, Context } from '~/interface'


@Provide()
export class TaskLogRepository {

  @App() protected readonly app: Application

  @Inject() protected readonly ctx: Context

  @Inject('jaeger:logger') protected readonly logger: Logger

  @Config('taskManServerConfig') protected readonly serverConfig: TaskManServerConfig

  db: Kmore<DbModel>
  protected _dbManager: DbManager<DbReplicaKeys>

  @Init()
  async init(): Promise<void> {
    const kmoreConfig = genKmoreComponentConfig(this.serverConfig, initDbConfig)
    // this._dbManager = await this.ctx.requestContext.getAsync(DbManager)
    const container = this.app.getApplicationContext()
    this._dbManager = await container.getAsync(DbManager)
    // @ts-ignore for DecoratorManager not single
    this._dbManager.create(kmoreConfig, this.ctx.tracerManager, this.logger)
    const db = this._dbManager.getInstance<DbModel>(DbReplica.taskMaster)
    if (! db) {
      throw new Error(`Create db instance failed with DbId: "${DbReplica.taskMaster}"`)
    }
    this.db = db
  }

  async [ServerMethod.create](input: InitTaskLogDTO): Promise<TaskLogDTO> {
    const { db } = this
    const ret = await db.refTables.ref_tb_task_log()
      .insert(input)
      .returning('*')
      .then((arr) => {
        const [row] = arr
        if (! row) {
          throw new Error('insert failed')
        }
        return row
      })

    return ret as unknown as TaskLogDTO
  }


  async [ServerMethod.read](id: TaskLogDTO['taskLogId']): Promise<TaskLogDTO | undefined> {
    const { db } = this
    const ret = await db.refTables.ref_tb_task_log()
      .where('task_log_id', id)
      .limit(1)
      .then(arr => arr[0])

    return ret as unknown as TaskLogDTO
  }

}

