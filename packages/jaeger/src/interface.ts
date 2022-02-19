import { IMidwayContext } from '@midwayjs/core'
import { Context as KoaContext } from '@midwayjs/koa'


export {
  JsonObject,
  JsonResp,
  JsonType,
} from '@waiting/shared-types'

export {
  IMidwayApplication as Application,
  IMiddleware, NextFunction,
} from '@midwayjs/core'
export type Context = IMidwayContext<KoaContext>

export { NpmPkg } from '@waiting/shared-types'

