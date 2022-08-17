import { MidwayConfig } from '@midwayjs/core'
import { Context as KoaCtx } from '@midwayjs/koa'
import { JwtState } from '@mw-components/jwt'


// @ts-ignore
declare module '@midwayjs/koa/dist/interface' {
  interface Context {
    reqId: string
    jwtState: JwtState<any>
  }
}
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

export { Options as FetchOptions } from '@mw-components/fetch'

export {
  TracerTag, TracerLog, HeadersKey,
} from '@mw-components/jaeger'

export { JwtResult } from '@mw-components/jwt'

export {
  JsonObject,
  JsonResp,
  JsonType,
  NpmPkg,
} from '@waiting/shared-types'

export { KmoreTransaction as DbTransaction } from 'kmore'


export interface AppInfomation {
  pkgName: string
  pkgVer: string
  pid: number
  ppid: number
  ip: string
  reqId: string
  [key: string]: string | number
}

