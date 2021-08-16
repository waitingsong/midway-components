import {
  JwtMiddlewareConfig,
  JwtOptions,
} from './types'


export const initialJwtMiddlewareConfig: Readonly<JwtMiddlewareConfig> = {
  enableMiddleware: true,
  ignore: [
    '/metrics',
    '/ping',
  ],
  cookie: false,
  passthrough: false,
}
export const initialJwtOptions: Readonly<JwtOptions> = {
  debug: false,
  secret: '',
}

export const schemePrefix = 'Bearer'

export enum JwtMsg {
  AuthFailed = 'Authentication Failed',

  InvalidInput = 'Value of input invalid',
  InvalidInputBuffer = 'Value of input is empty Buffer',
  InvalidInputObject = 'Value of input is invalid Object',
  InvalidInputString = 'Value of input is blank string',

  VerifyNotFunc = 'jwt.verify is not a function',
  TokenNotFound = 'Token not found. Header format is "Authorization: Bearer <token>"',
  TokenValidFailed = 'Token validation failed',
  VSceretInvalid = 'VerifySecret not provided',
}

