
import type { Config, ConfigKey, MiddlewareConfig } from './lib/types.js'


export { AutoConfiguration as Configuration } from './configuration.js'
export * from './app/index.controller.js'
export * from './lib/index.js'
export * from './middleware/index.middleware.js'
export type {
  DecodeOptions,
  JwtHeader,
  SignOptions,
  Secret,
} from 'jsonwebtoken'

// @ts-expect-error for midway
declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    [ConfigKey.config]?: Partial<Config>
    [ConfigKey.middlewareConfig]?: Partial<MiddlewareConfig>
  }
}

/*
declare module '@midwayjs/koa/dist/interface' {
  interface Context {
    jwtState: JwtState<any>
  }
} */


export type {
  JsonObject,
  JsonResp,
  JsonType,
  NpmPkg,
} from '@waiting/shared-types'


