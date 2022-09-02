
import {
  Config,
  ConfigKey,
  MiddlewareConfig,
} from './lib/types'


export { AutoConfiguration as Configuration } from './configuration'
export * from './lib/index'
export * from './app/index.controller'
export {
  getComponentConfig,
  getMiddlewareConfig,
} from './util/common'
export * from './middleware/jwt.middleware'
export {
  DecodeOptions,
  JwtHeader,
  SignOptions,
  Secret,
} from 'jsonwebtoken'

// @ts-ignore
declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    [ConfigKey.config]: Partial<Config>
    [ConfigKey.middlewareConfig]: Partial<MiddlewareConfig>
  }
}

/*
declare module '@midwayjs/koa/dist/interface' {
  interface Context {
    jwtState: JwtState<any>
  }
} */
