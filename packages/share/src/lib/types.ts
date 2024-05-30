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
  // DecoratorHandlerExecutorAsyncForbidden = '[@mwcp/share] Async method is not supported default. Please override method "executorAsync()" in your class which extends "DecoratorHandlerBase"',
  // DecoratorHandlerExecutorSyncForbidden = '[@mwcp/share] Sync method is not supported default. Please override method "executorSync()" in your class which extends "DecoratorHandlerBase"',
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
  _routerInfo: RouterInfoLite
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

export interface RouterInfoLite {
  /** uuid */
  id: string
  /** router prefix from controller */
  prefix: string
  /** router alias name */
  routerName: string
  /** router path, without prefix */
  url: string | RegExp
  /** request method for http, like get/post/delete */
  requestMethod: string
  /** router handler function key，for IoC container load */
  handlerName: string
  /** serverless func load key, will be override by @ServerlessTrigger and @ServerlessFunction */
  funcHandlerName: string
  /** controller provideId */
  controllerId: string
  /**
   * serverless function name, will be override by @ServerlessTrigger and @ServerlessFunction
   */
  functionName: string
  /**
   * url with prefix
   */
  fullUrl: string
  /**
   * pattern after path-regexp compile
   */
  fullUrlCompiledRegexp: RegExp | undefined
  /**
   * url after wildcard and can be path-to-regexp by path-to-regexp v6
   */
  fullUrlFlattenString: string
}
