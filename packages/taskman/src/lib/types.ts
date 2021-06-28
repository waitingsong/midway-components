import type { Options as FetchOptions } from '@mw-components/fetch'

import { JsonObject } from '../interface'

import { CreateTaskDTO, TaskDTO } from './tm.dto'


/**
 * TaskMan Client Config
 */
export interface TaskManClientConfig {
  /**
   * host url
   * @default http://localhost:7001
   * @example http://192.168.0.2
   */
  host: string
  /**
   * @default ['authorization']
   * @example ['authorization', 'user-agent']
   */
  transferHeaders: string[]
}

/**
 * @description http request path `${base}/${action}`, eg. /task_agent/create
 */
export enum ServerAgent {
  base = '/task_agent',
  create = 'create',
  hello = 'hello',
  stats = 'stats',
  setProgress = 'setProgress',
  setRunning = 'setRunning',
  setFailed = 'setFailed',
  setCancelled = 'setCancelled',
  setSucceeded = 'setSucceeded',
  getProgress = 'getProgress',
}
export enum ServerMethod {
  create = 'create',
  hello = 'hello',
  stats = 'stats',
  setProgress = 'setProgress',
  setRunning = 'setRunning',
  setFailed = 'setFailed',
  setCancelled = 'setCancelled',
  setSucceeded = 'setSucceeded',
  getProgress = 'getProgress',
}

export interface CreateTaskOptions {
  data: CreateTaskDTO
  host?: TaskManClientConfig['host']
  method?: FetchOptions['method']
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
  database: DbConfig
}

export interface DbConfig {
  connection: {
    host: string,
    port: number,
    database: string,
    user: string,
    password: string,
  }
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
   * `will_start BETWEERN now() - INTERVAL ${earlierThanTimeIntv} AND now()`
   */
  earlierThanTimeIntv: string
}
