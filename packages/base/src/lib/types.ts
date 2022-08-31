import { MidwayConfig } from '@midwayjs/core'
import { Context as KoaCtx } from '@midwayjs/koa'


export enum ConfigKey {
  namespace = 'base',
  config = 'baseConfig',
  middlewareConfig = 'baseMiddlewareConfig',
  componentName = 'baseComponent',
  middlewareName = 'baseMiddleware',
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

export { Options as FetchOptions } from '@mwcp/fetch'

export {
  TracerTag, TracerLog, HeadersKey,
} from '@mwcp/jaeger'

export { JwtResult } from '@mwcp/jwt'

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


export enum ErrorCode {
  success = 0,
  E_Common = 1,
  /** 身份校验失败 */
  E_Unauthorized = 401,
  /** 资源未找到 */
  E_Not_Found = 404,
  /**
   * 服务内部异常
   * @description 在向外屏蔽内部服务异常时可使用。注意：返回结果将自动屏蔽任何异常详情
   */
  E_Internal_Server = 500,
  /**
   * 服务内部异常
   * @description Knex 连接数据库超时
   */
  E_Db_Acq_Connection_Timeout = 999,
  /**
   * 管理员不存在
   */
  E_Admin_Not_Exists = 2404,
}

