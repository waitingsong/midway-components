import type {
  IMidwayApplication,
  IMidwayContainer,
  IMiddleware,
  MidwayConfig,
  NextFunction,
} from '@midwayjs/core'
import type { Context as KoaCtx, Application } from '@midwayjs/koa'
import type { MiddlewareConfig as MWConfig } from '@waiting/shared-types'


export {
  JsonResp, JsonObject, JsonType, PlainJsonValue,
} from '@waiting/shared-types'

export {
  Application,
  IMidwayApplication,
  IMidwayContainer,
  IMiddleware,
  NextFunction,
}

export enum ConfigKey {
  namespace = 'share',
  config = 'shareConfig',
  middlewareConfig = 'shareMiddlewareConfig',
  componentName = 'shareComponent',
  middlewareName = 'shareMiddleware',
  enableJsonRespMiddlewareConfig = 'enableJsonRespMiddlewareConfig',
}

export enum Msg {
  hello = 'hello world',
  AuthFailed = 'Authentication Failed',
}
export interface Config extends BaseConfig {
  /**
   * Enable default http route, eg. /hello
   * @default false
   */
  enableDefaultRoute?: boolean | undefined
}
export interface MiddlewareOptions {
  debug: boolean
}


export interface Context extends KoaCtx {
  reqId: string
  _internalError?: Error
}

export type AppConfig = Partial<MidwayConfig>


export interface AppInfomation {
  pkgName: string
  pkgVer: string
  pid: number
  ppid: number
  ip: string
  reqId: string
  [key: string]: string | number
}


export interface BaseConfig {
  /**
   * Enable default http route, eg. /hello
   * @default false
   */
  enableDefaultRoute?: boolean | undefined
}


export type MiddlewareConfig<T> = MWConfig<T>

/** 分页查询结果包装器 */
export class PagingResult<T> {

  /**
   * Total count of rows in table
   *
   * @note This is the number of query response rows,
   *  not the number of rows in the current page,
   *  also not the number of pages.
   */
  total: number
  /**
   * Current page number, start from 1
   */
  page: number
  /**
   * Number of rows of each page.
   * The number rows of the last page may be less than this value
   */
  pageSize: number
  rows: T[]

}
