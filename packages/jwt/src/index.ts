// @ts-ignore
import { PowerPartial } from '@midwayjs/core'

import {
  Config,
  ConfigKey,
  MiddlewareConfig,
} from './lib/index'


export { AutoConfiguration as Configuration } from './configuration'
export * from './lib/index'
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


declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    [ConfigKey.config]: PowerPartial<Config>
    [ConfigKey.middlewareConfig]: PowerPartial<MiddlewareConfig>
  }
}
