
export { AutoConfiguration as Configuration } from './configuration'
export * from './middleware/jwt.middleware'
export * from './lib/index'
export {
  getConfigFromApp,
  getMiddlewareConfigFromApp,
} from './util/common'
export {
  DecodeOptions,
  JwtHeader,
  SignOptions,
  Secret,
} from 'jsonwebtoken'

