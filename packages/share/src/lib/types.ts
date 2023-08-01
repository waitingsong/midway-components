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
  Application,
  IMidwayApplication,
  IMidwayContainer,
  IMiddleware,
  NextFunction,
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
