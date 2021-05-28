import {
  Config,
  MiddlewareConfig,
  MiddlewareOptions,
} from './types'


export const initialConfig: Readonly<Config> = {
  secret: '',
}
export const initMiddlewareOptions: MiddlewareOptions = {
  debug: false,
  cookie: false,
  passthrough: false,
}
export const initialMiddlewareConfig: Readonly<Omit<MiddlewareConfig, 'ignore' | 'match' | 'options'>> = {
  enableMiddleware: true,
}

export const initPathArray = [
  '/',
  '/auth/login',
  '/login',
  '/metrics',
  '/ping',
  '/favicon.ico',
  '/favicon.png',
]

export enum ConfigKey {
  namespace = 'jwt',
  config = 'jwtConfig',
  middlewareConfig = 'jwtMiddlewareConfig',
  componentName = 'jwtComponent',
  middlewareName = 'jwtMiddleware'
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

