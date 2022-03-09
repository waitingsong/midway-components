import {
  JwtMiddlewareConfig,
  Config,
} from './types'


export const enum ConfigKey {
  config = 'jwtConfig',
  middlewareConfig = 'jwtMiddlewareConfig',
  namespace = 'jwt',
  componentName = 'jwtComponent',
  middlewareName = 'jwtMiddleware'
}

export const initialConfig: Readonly<Config> = {
  secret: '',
}
export const initialMiddlewareConfig: Readonly<JwtMiddlewareConfig> = {
  enableMiddleware: true,
  ignore: [
    '/',
    '/auth/login',
    '/login',
    '/metrics',
    '/ping',
    '/favicon.ico',
    '/favicon.png',
  ],
  debug: false,
  cookie: false,
  passthrough: false,
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

