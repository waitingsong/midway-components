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
  KmoreComponent,
  TracerKmoreComponent,
  unsubscribeEventFuncOnResFinish,
} from '@mw-components/kmore'

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

  public db: KmoreComponent<DbModel> | TracerKmoreComponent<DbModel>

  @Init()
  async init(): Promise<void> {
    const container = this.app.getApplicationContext()
    const dbManager = await container.getAsync(DbManager) as DbManager
    const db = await dbManager.create<DbModel>(this.ctx, DbReplica.taskMaster, unsubscribeEventFuncOnResFinish)
    this.db = db
  }

  [ServerMethod.destroy](): void {
    if (this.db instanceof TracerKmoreComponent) {
      this.db.unsubscribeEvent()
    }
    // this.db.unsubscribe()
  }

  async [ServerMethod.create](input: TaskResultDTO): Promise<TaskResultDTO> {
    const { db } = this
    const ret = await db.camelTables.ref_tb_task_result()
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

  async [ServerMethod.read](id: TaskDTO['taskId']): Promise<TaskResultDTO | undefined> {
    const { db } = this
    const ret = await db.camelTables.ref_tb_task_result()
      .where('taskId', id)
      .limit(1)
      .then(arr => arr[0])

    return ret
  }

}

