import { MidwayConfig } from '@midwayjs/core'
import { Context as KoaCtx } from '@midwayjs/koa'


export interface Context extends KoaCtx {
  reqId: string
  _internalError?: Error
}


export {
  IMidwayApplication,
  IMidwayContainer,
  IMiddleware,
  NextFunction,
} from '@midwayjs/core'

export type AppConfig = Partial<MidwayConfig>
export { Application } from '@midwayjs/koa'


export interface AppInfomation {
  pkgName: string
  pkgVer: string
  pid: number
  ppid: number
  ip: string
  reqId: string
  [key: string]: string | number
}

