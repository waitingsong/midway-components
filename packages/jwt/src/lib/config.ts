import {
  JwtAuthenticateOptions,
  JwtMiddlewareConfig,
  JwtConfig,
} from './types'


export const initialAuthOpts: Readonly<JwtAuthenticateOptions> = {
  cookie: false,
  passthrough: false,
}
export const initialJwtMiddlewareConfig: Readonly<JwtMiddlewareConfig> = {
  ...initialAuthOpts,
  enableMiddleware: true,
  ignore: [
    '/',
    '/login',
    '/metrics',
    '/ping',
    '/favicon.ico',
    '/favicon.png',
  ],
  debug: false,
}
export const initialJwtConfig: Readonly<JwtConfig> = {
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

