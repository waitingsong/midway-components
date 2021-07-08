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
} from '@mw-components/kmore'

import {
  DbModel,
  DbReplica,
  DbReplicaKeys,
  TaskManServerConfig,
  ServerMethod,
  TaskResultDTO,
  TaskDTO,
} from '../lib/index'

import { Application, Context } from '~/interface'


@Provide()
export class TaskResultRepository {

  @App() protected readonly app: Application

  @Inject() protected readonly ctx: Context

  @Inject('jaeger:logger') protected readonly logger: Logger

  @Config('taskManServerConfig') protected readonly serverConfig: TaskManServerConfig

  db: KmoreComponent<DbModel> | TracerKmoreComponent<DbModel>
  protected _dbManager: DbManager<DbReplicaKeys>

  @Init()
  async init(): Promise<void> {
    const container = this.app.getApplicationContext()
    this._dbManager = await container.getAsync(DbManager)
    const db = await this._dbManager.create<DbModel>(this.ctx, DbReplica.taskMaster, false)
    this.db = db
  }

  [ServerMethod.destroy](): void {
    if (this.db instanceof TracerKmoreComponent) {
      this.db.unsubscribeEvent()
    }
    this.db.unsubscribe()
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

