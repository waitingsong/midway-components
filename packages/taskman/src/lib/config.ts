import {
  InitTaskDTO,
  InitTaskPayloadDTO,
  TaskProgressDTO,
} from './tm.dto'
import {
  DbConfig,
  PickInitTaskOptions,
  TaskManClientConfig,
  TaskState,
  TaskStatistics,
} from './types'


export const initTaskDTO: InitTaskDTO = {
  taskState: TaskState.init,
  willStart: new Date(),
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
//   will_start: new Date(),
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
  acquireConnectionTimeout: 10000,
  autoConnect: true,
  connection: {
    host: process.env.POSTGRES_HOST ? process.env.POSTGRES_HOST : 'localhost',
    port: process.env.POSTGRES_PORT ? +process.env.POSTGRES_PORT : 5432,
    database: process.env.POSTGRES_DB ? process.env.POSTGRES_DB : 'db_ci_test',
    user: process.env.POSTGRES_USER ? process.env.POSTGRES_USER : 'postgres',
    password: process.env.POSTGRES_PASSWORD ? process.env.POSTGRES_PASSWORD : 'postgres',
  },
  enableTracing: true,
  sampleThrottleMs: 1000,
}


export const initPickInitTasksOptions: PickInitTaskOptions = {
  ord: 'ASC',
  maxRows: 1,
  earlierThanTimeIntv: '1 week',
}


export const initTaskManClientConfig: TaskManClientConfig = {
  /** TaskMan Server host */
  host: 'http://localhost:7001',
  transferHeaders: ['authorization'],
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

