import { JwtConfig, JwtMiddlewareConfig, JwtState } from './lib/index'


export { AutoConfiguration as Configuration } from './configuration'
export { registerMiddleware } from './configuration'
export {
  JwtMiddleware, jwtMiddleware,
} from './middleware/jwt.middleware'
export * from './lib/index'

export {
  DecodeOptions,
  JwtHeader,
  SignOptions,
  Secret,
} from 'jsonwebtoken'


declare module '@midwayjs/core' {
  interface Application{
    jwtConfig: JwtConfig
    jwtMiddlewareConfig: JwtMiddlewareConfig
  }

  interface Context {
    jwtState: JwtState
  }
}

