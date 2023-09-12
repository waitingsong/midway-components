/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { DbConfig } from '@mwcp/kmore'

import { dbDict, DbModel } from './db.model.js'
import {
  InitTaskDTO,
  InitTaskPayloadDTO,
  TaskProgressDTO,
  MiddlewareConfig,
  MiddlewareOptions,
  PickInitTaskOptions,
  TaskClientConfig,
  TaskServerConfig,
  TaskState,
  TaskStatistics,
} from './types.js'


export const initMiddlewareOptions: MiddlewareOptions = {
  debug: false,
}
export const initialMiddlewareConfig: Readonly<Omit<MiddlewareConfig, 'ignore' | 'match' | 'options'>> = {
  enableMiddleware: true,
}

export const initTaskDTO: InitTaskDTO = {
  /**
   * default 1
   */
  taskTypeId: 1,
  taskTypeVer: 1,
  taskState: TaskState.init,
  expectStart: new Date(),
  startedAt: null,
  isTimeout: false,
  /**
   * expiry interval
   * @default '2h'
   * @example
   * - '30s', '2min', '1day', '2weeks', '1mon', '00:02:00'
   * - { hours: 12, minutest: 15 }
   * @description convert
   * - intval to string: intv.toISOString()
   * - intval to postgres obj: intv.toPostgres()
   */
  timeoutIntv: '2h',
  ctime: 'now()',
  mtime: null,
}

export const initTaskPayloadDTO: InitTaskPayloadDTO = {
  ctime: 'now()',
  mtime: null,
}

// export const initTaskDO: Omit<TbTaskDO, 'task_id'> = {
//   /** bigInt string */
//   // task_id: '',
//   task_state: TaskState.init,
//   expect_start: new Date(),
//   started_at: null,
//   is_timeout: false,
//   /**
//    * expiry interval
//    * @default '2h'
//    * @example
//    * - '30s', '2min', '1day', '2weeks', '1mon', '00:02:00'
//    * - { hours: 12, minutest: 15 }
//    * @description convert
//    * - intval to string: intv.toISOString()
//    * - intval to postgres obj: intv.toPostgres()
//    */
//   timeout_intv: initTaskDTO.timeoutIntv,
//   ctime: 'now()',
//   mtime: null,
// }


export const initTaskProgressDTO: Omit<TaskProgressDTO, 'taskId'> = {
  taskProgress: 0,
  ctime: 'now()',
  mtime: null,
}


export const initDbConfig: DbConfig<DbModel> = {
  dict: dbDict,
  config: {
    acquireConnectionTimeout: 60000,
    // 'pgnative', 'pg', 'pgnative'
    client: 'pg',
    connection: {
      host: process.env['POSTGRES_HOST'] ? process.env['POSTGRES_HOST'] : 'localhost',
      port: process.env['POSTGRES_PORT'] ? +process.env['POSTGRES_PORT'] : 5432,
      database: process.env['POSTGRES_DB'] ? process.env['POSTGRES_DB'] : 'db_ci_mw',
      user: process.env['POSTGRES_USER'] ? process.env['POSTGRES_USER'] : 'postgres',
      password: process.env['POSTGRES_PASSWORD'] ? process.env['POSTGRES_PASSWORD'] : 'postgres',
    },
    pool: {
      min: 0,
      max: 30,
      afterCreate: (conn: any, done: any) => {
        const TZ = process.env['PGTZ'] as string | undefined
        if (TZ) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          conn.query(`SET time zone '${TZ}';`, (err: Error | undefined) => done(err, conn))
        }
        else {
          done(void 0, conn)
        }
      },
      /** @link https://stackoverflow.com/a/67621567 */
      propagateCreateError: false,
    },
  },
  enableTrace: true,
  traceResponse: true,
  sampleThrottleMs: 3000,
}


export const initPickInitTasksOptions: PickInitTaskOptions = {
  ord: 'ASC',
  maxRows: 1,
  earlierThanTimeIntv: '1 week',
  taskTypeId: 1,
  taskTypeVerList: [],
}


export const initTaskServerConfig: Omit<TaskServerConfig, 'dataSource'> = {
  /** TaskMan Server host */
  host: 'http://localhost:7001',
  expInterval: '30min',
  headerKey: 'x-task-agent',
  headerKeyTaskId: 'x-task-id',
}

export const initTaskClientConfig: TaskClientConfig = {
  /** TaskMan client host */
  host: 'http://localhost:7001',
  transferHeaders: ['authorization', 'user-agent'],
  headerKeyTaskId: initTaskServerConfig.headerKeyTaskId,
  pickTaskTimer: 1000,
  enableTrace: true,
  maxRunner: 2,
  supportTaskMap: new Map([ [1, '*'] ]),
}

export const initTaskStatistics: TaskStatistics = {
  init: 0,
  pending: 0,
  running: 0,
  failed: 0,
  suspended: 0,
  succeeded: 0,
  cancelled: 0,
}


