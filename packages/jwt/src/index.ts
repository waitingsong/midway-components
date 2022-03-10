
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

