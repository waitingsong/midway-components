import {
  InitTaskDTO,
  InitTaskPayloadDTO,
  TaskProgressDTO,
  DbConfig,
  MiddlewareConfig,
  MiddlewareOptions,
  PickInitTaskOptions,
  TaskClientConfig,
  TaskServerConfig,
  TaskState,
  TaskStatistics,
} from './types'


export const initMiddlewareOptions: MiddlewareOptions = {
  debug: false,
}
export const initialMiddlewareConfig: Readonly<Omit<MiddlewareConfig, 'ignore' | 'match' | 'options'>> = {
  enableMiddleware: true,
}

export enum ConfigKey {
  namespace = 'taskman',
  config = 'taskClientConfig',
  middlewareConfig = 'taskMiddlewareConfig',
  // componentName = 'taskmanComponent',
  middlewareName = 'taskmanMiddleware',
  clientConfig = 'taskClientConfig',
  serverConfig = 'taskServerConfig'
}

export const initTaskDTO: InitTaskDTO = {
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


export const initDbConfig: Required<DbConfig> = {
  acquireConnectionTimeout: 60000,
  autoConnect: true,
  connection: {
    host: process.env['POSTGRES_HOST'] ? process.env['POSTGRES_HOST'] : 'localhost',
    port: process.env['POSTGRES_PORT'] ? +process.env['POSTGRES_PORT'] : 5432,
    database: process.env['POSTGRES_DB'] ? process.env['POSTGRES_DB'] : 'db_ci_mw',
    user: process.env['POSTGRES_USER'] ? process.env['POSTGRES_USER'] : 'postgres',
    password: process.env['POSTGRES_PASSWORD'] ? process.env['POSTGRES_PASSWORD'] : 'postgres',
  },
  pool: {
    min: 0,
    max: 10,
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
  enableTracing: false,
  tracingResponse: true,
  sampleThrottleMs: 1000,
}


export const initPickInitTasksOptions: PickInitTaskOptions = {
  ord: 'ASC',
  maxRows: 1,
  earlierThanTimeIntv: '1 week',
}


export const initTaskServerConfig: Omit<TaskServerConfig, 'dbConfigs'> = {
  /** TaskMan Server host */
  host: 'http://localhost:7001',
  expInterval: '30min',
  headerKey: 'x-task-agent',
  headerKeyTaskId: 'x-task-id',
}

export const initTaskClientConfig: TaskClientConfig = {
  /** TaskMan client host */
  host: 'http://localhost:7001',
  // clientHost: 'http://localhost:7001',
  transferHeaders: ['authorization', 'user-agent'],
  headerKeyTaskId: initTaskServerConfig.headerKeyTaskId,
  pickTaskTimer: 2000,
  minPickTaskCount: 5,
  maxPickTaskCount: 1000,
  maxRunner: 2,
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


