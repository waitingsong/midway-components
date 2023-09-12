import { Rule } from '@midwayjs/validate'
import type { FetchOptions, JsonObject } from '@mwcp/boot'
import { DataSource } from '@mwcp/kmore'
import {
  MiddlewareConfig as MWConfig,
  JsonType,
  RecordCamelKeys,
} from '@waiting/shared-types'


import { DbReplica } from './config.types.js'

import { IPostgresInterval } from '##/interface.js'
import { taskManValidSchemas } from '##/validation-schema/index.schema.js'


export enum ConfigKey {
  namespace = 'taskman',
  // config = 'taskClientConfig',
  middlewareConfig = 'taskMiddlewareConfig',
  componentName = 'taskmanComponent',
  middlewareName = 'taskmanMiddleware',
  clientConfig = 'taskClientConfig',
  serverConfig = 'taskServerConfig'
}

export enum Msg {
  hello = 'hello world',
}


export type Config = TaskServerConfig | TaskClientConfig

export interface MiddlewareOptions {
  debug: boolean
}
export type MiddlewareConfig = MWConfig<MiddlewareOptions>

/**
 * TaskMan Client Config
 */
export interface TaskClientConfig {
  /**
   * client host url
   * @default http://localhost:7001
   * @example http://192.168.0.2
   */
  host: string
  // /**
  //  * task runner url
  //  * @default http://localhost:7001
  //  */
  // clientHost: string
  /**
   * @default ['authorization']
   * @example ['authorization', 'user-agent']
   */
  transferHeaders: string[]
  /**
   * @default x-task-id
   */
  headerKeyTaskId: string
  /**
   * @default 1000(ms)
   */
  pickTaskTimer: number
  /**
   * Support task type id:ver[] list,
   */
  supportTaskMap: SupportTaskMapType
  /**
   * @default true
   */
  enableTrace: boolean
  maxRunner: number
}
export type SupportTaskMapType = Map<TaskDTO['taskTypeId'], TaskTypeVerListType>
export type TaskTypeVerListType = TaskDTO['taskTypeVer'][] | '*'


/**
 * @description http request path `${base}/${action}`, eg. /task_agent/create
 */
export enum ClientURL {
  base = '/task_agent',
  /** start task pick and distribution */
  start = 'start',
  /** stop task pick and distribution */
  stop = 'stop',
  hello = 'hello',
  status = 'status',
}
export enum ClientMethod {
  start = 'start',
  stop = 'stop',
  status = 'status',
  hello = 'hello',
}
/**
 * @description http request path `${base}/${action}`, eg. /taskman/create
 */
export enum ServerURL {
  base = '/taskman',
  create = 'create',
  hello = 'hello',
  stats = 'stats',
  setProgress = 'set_progress',
  setRunning = 'set_running',
  setFailed = 'set_failed',
  setCancelled = 'set_cancelled',
  setSucceeded = 'set_succeeded',
  getInfo = 'get_info',
  getProgress = 'get_progress',
  getResult = 'get_result',
  getLog = 'get_log',
  pickTasksWaitToRun = 'pick_tasks',
  getPayload = 'get_payload',
  setState = 'set_state',
}

export enum ServerMethod {
  /** start task pick and distribution */
  startOne = 'startOne',
  /** stop task pick and distribution */
  stop = 'stop',
  /** Create a task recored */

  create = 'create',
  read = 'read',
  destroy = 'destroy',
  hello = 'hello',
  stats = 'stats',
  setProgress = 'setProgress',
  setRunning = 'setRunning',
  setFailed = 'setFailed',
  setCancelled = 'setCancelled',
  setSucceeded = 'setSucceeded',

  getInfo = 'getInfo',
  getProgress = 'getProgress',
  getResult = 'getResult',

  /** Retrieve task, taskId from request header */
  retrieveTask = 'retrieveTask',

  notifyProgress = 'notifyProgress',
  notifyRunning = 'notifyRunning',
  notifyFailed = 'notifyFailed',
  notifyCancelled = 'notifyCancelled',
  notifySucceeded = 'notifySucceeded',

  pickTasksWaitToRun = 'pickTasksWaitToRun ',
  getPayload = 'getPayload',
  setState = 'setState',

  getLog = 'getLog',
}

/**
 * 调用创建任务接口参数
 */
export interface CreateTaskOptions {
  /**
   * 任务参数
   * @description 若 json 空则提取平级 headers 赋值到 json.headers
   */
  createTaskDTO: CreateTaskDTO
  /**
   * TM服务器地址, 采用 POST 提交
   * @example http://localhost:7001
   */
  host?: TaskClientConfig['host']
  /**
   * 向TM服务器发送 HTTP 请求时附带请求头数据
   */
  headers?: FetchOptions['headers']
}

/**
 * HTTP info send to application
 */
export interface CallTaskOptions {
  url: FetchOptions['url']
  method: FetchOptions['method']
  /**
   * @default json
   */
  dataType?: FetchOptions['dataType']
  headers?: FetchOptions['headers']
  data?: JsonObject
}


/**
 * Server Config
 */
export interface TaskServerConfig {
  /** server host */
  host: string
  expInterval: TaskDTO['timeoutIntv']
  dataSource: DataSource<DbReplica.taskMaster>
  /**
   * Indicate request from task-agent
   * @default x-task-agent
   */
  headerKey: string
  /**
   * @default x-task-id
   */
  headerKeyTaskId: string
}

// export interface DbConfig {
//   connection: {
//     host: string,
//     port: number,
//     database: string,
//     user: string,
//     password: string,
//   }
//   pool: KnexConfig['pool']
//   acquireConnectionTimeout?: number
//   /**
//    * @default true
//    */
//   autoConnect?: boolean
//   /**
//    * @default true
//    */
//   enableTracing?: boolean
//   /**
//    * @default true
//    */
//   tracingResponse?: boolean
//   /**
//    * @default 300(ms)
//    */
//   sampleThrottleMs?: number
// }


export enum TaskState {
  /**
   * 初始化
   * @description 新建任务默认状态
   */
  init = 'init',
  /**
   * 队列中
   * @description 任务已经被提取发送给客户端执行
   */
  pending = 'pending',
  /**
   * 运行中
   */
  running = 'running',
  /** 已失败 */
  failed = 'failed',
  /**
   * 已挂起
   * @description 任务被提取发送给客户端执行时异常
   */
  suspended = 'suspended',
  /** 已成功 */
  succeeded = 'succeeded',
  /** 已取消 */
  cancelled = 'cancelled',
}

export type TaskStatistics = Record<TaskState, number>

export class PickInitTaskOptions {
  /**
   * @default ASC
   */
  @Rule(taskManValidSchemas.text)
  ord: 'ASC' | 'DESC'

  /**
   * @default 1
   */
  @Rule(taskManValidSchemas.rows)
  maxRows: number

  /**
   * @default '1 week'
   * @description search range
   * `expect_start BETWEERN now() - INTERVAL ${earlierThanTimeIntv} AND now()`
   */
  @Rule(taskManValidSchemas.text)
  earlierThanTimeIntv: string

  @Rule(taskManValidSchemas.taskTypeId)
  taskTypeId: TaskDTO['taskTypeId']

  /**
   * Empty array means no limit
   */
  @Rule(taskManValidSchemas.taskTypeVerList)
  taskTypeVerList: TaskDTO['taskTypeVer'][] | '*'
}


export class CommonSetMethodInputData {
  @Rule(taskManValidSchemas.taskId.required())
  id: TaskDTO['taskId']

  @Rule(taskManValidSchemas.text.optional())
  msg?: TaskLogDTO['taskLogContent']
}
export class SetProgressInputData extends CommonSetMethodInputData {
  @Rule(taskManValidSchemas.process.required())
  progress: TaskProgressDTO['taskProgress']
}
export class SetStateInputData extends CommonSetMethodInputData {
  @Rule(taskManValidSchemas.text.optional())
  state: TaskDTO['taskState']
}

export class SetSucceededInputData extends CommonSetMethodInputData {
  @Rule(taskManValidSchemas.json)
  result: TaskResultDTO['json']
}

// export interface TaskRunnerState {
//   count: number
//   max: number
// }

// export interface TaskAgentConfig {
//   /**
//    * @default 1
//    */
//   maxRunning: number
//   /**
//    * start an agent when accessed by /ping
//    * @default false
//    */
//   enableStartOneByPing: boolean
// }


export interface TaskAgentState {
  /**
   * Started taskAgent uuid when calling /task_agent/start_one,
   * blank string means no running TaskAgentService during this request
   */
  agentId: string
  isRunning: boolean
}


/* --- tm.dto --- */
export type TaskDTO = RecordCamelKeys<TbTaskDO>
export type TaskProgressDTO = RecordCamelKeys<TbTaskProgressDO>
export type TaskPayloadDTO = RecordCamelKeys<TbTaskPayloadDO>
export type TaskResultDTO = RecordCamelKeys<TbTaskResultDO>
export type TaskLogDTO = RecordCamelKeys<TbTaskLogDO>
export type TaskProgressDetailDTO = Partial<TaskProgressDTO> & Pick<TaskDTO, 'taskState' | 'taskId'>

export type TaskFullDTO = TaskDTO & {
  taskProgress: TbTaskProgressDO['task_progress'] | null,
  json: TaskPayloadDTO['json'] | null,
}

export type InitTaskDTO = Omit<TaskDTO, 'taskId'>
export type InitTaskPayloadDTO = Omit<TaskPayloadDTO, 'taskId' | 'json'>
export type InitTaskLogDTO = Omit<TaskLogDTO, 'taskLogId'>

export class CreateTaskDTO {
  @Rule(taskManValidSchemas.taskTypeId.required())
  taskTypeId: number

  /**
   * @default 1 default task
   */
  @Rule(taskManValidSchemas.taskTypeVer.optional())
  taskTypeVer?: number

  /**
   * Task execution information
   */
  @Rule(taskManValidSchemas.json.required())
  json: TaskPayloadDTO['json']

  /**
   * @default now
   */
  @Rule(taskManValidSchemas.date)
  expectStart?: TaskDTO['expectStart']

  /**
   * Expiry interval
   *
   * @default 30min
   * @example {
   *   hours: 12
   *   minutest: 30
   * }
   * @description convert
   * - intval to string: intv.toISOString()
   * - intval to postgres obj: intv.toPostgres()
   */
  @Rule(taskManValidSchemas.timeoutIntv)
  timeoutIntv?: TaskDTO['timeoutIntv']
}


export class SetProgressDTO {
  taskId: TaskDTO['taskId']
  taskProgress: TaskProgressDTO['taskProgress']
}



/* --- database.do --- */

export class TbTaskTypeDO {
  task_type_id: number
  task_type_name: string
  ctime: Date | 'now()'
  mtime: Date | null
}

export class TbTaskDO {
  /** bigInt string */
  task_id: string
  task_state: TaskState
  task_type_id: number
  task_type_ver: number
  expect_start: Date
  started_at: Date | null
  is_timeout: boolean
  /**
   * expiry interval
   * @example {
   *   hours: 12
   *   minutest: 30
   * }
   * @description convert
   * - intval to string: intv.toISOString()
   * - intval to postgres obj: intv.toPostgres()
   */
  timeout_intv: Partial<IPostgresInterval> | string
  ctime: Date | 'now()'
  mtime: Date | null
}

export class TbTaskPayloadDO {
  /** bigInt string */
  task_id: string
  /** custom data */
  json: CallTaskOptions
  ctime: Date | 'now()'
  mtime: Date | null
}

export class TbTaskArchiveDO extends TbTaskDO {
}


export class TbTaskProgressDO {
  /** bigInt string */
  task_id: string
  /** 0 - 100 */
  task_progress: number
  ctime: Date | 'now()'
  mtime: Date | null
}

export class TbTaskResultDO {
  /** bigInt string */
  task_id: string
  json: JsonType
  ctime: Date | 'now()'
}

export class TbTaskLogDO {
  /** bigInt string */
  task_log_id: string
  /** bigInt string */
  task_id: string
  task_log_content: string
  ctime: Date | 'now()'
}

export class ViTaskDO extends TbTaskDO {}

