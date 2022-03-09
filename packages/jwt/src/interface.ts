import { IMidwayApplication, IMidwayContext } from '@midwayjs/core'
import { Context as KoaContext } from '@midwayjs/koa'

import { Config, JwtMiddlewareConfig, JwtState } from './lib/index'


export {
  JsonObject,
  JsonResp,
  JsonType,
  MiddlewareConfig,
  NpmPkg,
} from '@waiting/shared-types'

declare module '@midwayjs/core' {
  interface Application{
    jwtConfig: Config
    jwtMiddlewareConfig: JwtMiddlewareConfig
  }

  interface Context {
    jwtState: JwtState
  }
}

export {
  IMidwayApplication,
  IMidwayContainer,
  IMiddleware,
  NextFunction,
} from '@midwayjs/core'
export type Application = IMidwayApplication<Context>
export type Context = IMidwayContext<KoaContext>

export {
  DecodeOptions,
  SignOptions,
  Secret,
} from 'jsonwebtoken'

