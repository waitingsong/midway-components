import { IMidwayContext } from '@midwayjs/core'
import { Context as KoaContext } from '@midwayjs/koa'

import { JwtConfig, JwtMiddlewareConfig, JwtState } from './lib/index'


export {
  JsonObject,
  JsonResp,
  JsonType,
  NpmPkg,
} from '@waiting/shared-types'

declare module '@midwayjs/core' {
  interface Application{
    jwtConfig: JwtConfig
    jwtMiddlewareConfig: JwtMiddlewareConfig
  }

  interface Context {
    jwtState: JwtState
  }
}

export {
  IMidwayApplication as Application,
  IMiddleware, NextFunction,
} from '@midwayjs/core'
export type Context = IMidwayContext<KoaContext>

export {
  DecodeOptions,
  SignOptions,
  Secret,
} from 'jsonwebtoken'

