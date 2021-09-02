import { KnexConfig } from '@mw-components/kmore'

import { JsonObject, FetchOptions } from '../interface'

import { CreateTaskDTO, TaskDTO, TaskLogDTO, TaskProgressDTO } from './tm.dto'


/**
 * TaskMan Client Config
 */
export interface TaskManClientConfig {
  /**
   * server host url
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
  headerKeyTaskId?: string
  /**
   * @default 2000(ms)
   */
  pickTaskTimer: number
  /**
   * Mininum loop times until no 'init' task
   * @default 5
   */
  minPickTaskCount: number
  /**
   * Max loop times until no 'init' task
   * @default 1000 (loop times, not tasks number)
   */
  maxPickTaskCount: number
  /**
   * @default 4
   */
  maxRunner: number
}

/**
 * @description http request path `${base}/${action}`, eg. /task_agent/create
 */
export enum ServerAgent {
  base = '/task_agent',
  /** start task pick and distribution */
  startOne = 'start_one',
  /** stop task pick and distribution */
  stop = 'stop',
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
  host?: TaskManClientConfig['host']
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
  headers?: FetchOptions['headers']
  data?: JsonObject
}


/**
 * TaskMan Server Config
 */
export interface TaskManServerConfig {
  expInterval: TaskDTO['timeoutIntv']
  dbConfigs: DbConfig
  /**
   * Indicate request from task-agent
   * @default x-task-agent
   */
  headerKey?: string
  /**
   * @default x-task-id
   */
  headerKeyTaskId?: string
}

export interface DbConfig {
  connection: {
    host: string,
    port: number,
    database: string,
    user: string,
    password: string,
  }
  pool: KnexConfig['pool']
  acquireConnectionTimeout?: number
  /**
   * @default true
   */
  autoConnect?: boolean
  /**
   * @default true
   */
  enableTracing?: boolean
  /**
   * @default true
   */
  tracingResponse?: boolean
  /**
   * @default 300(ms)
   */
  sampleThrottleMs?: number
}


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

export interface PickInitTaskOptions {
  /**
   * @default ASC
   */
  ord: 'ASC' | 'DESC'
  /**
   * @default 1
   */
  maxRows: number
  /**
   * @default '1 week'
   * @description search range
   * `expect_start BETWEERN now() - INTERVAL ${earlierThanTimeIntv} AND now()`
   */
  earlierThanTimeIntv: string
}



export interface CommonSetMethodInputData {
  id: TaskDTO['taskId']
  msg?: TaskLogDTO['taskLogContent']
}
export interface SetProgressInputData extends CommonSetMethodInputData {
  progress: TaskProgressDTO['taskProgress']
}
export interface SetStateInputData extends CommonSetMethodInputData {
  state: TaskDTO['taskState']
}

export interface TaskRunnerState {
  count: number
  max: number
}

export interface AgentConcurrentConfig {
  max: number
  count: number
}
