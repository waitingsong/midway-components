import { Config, JwtMiddlewareConfig } from '../index'
import {
  initialConfig,
  initialMiddlewareConfig,
  initMiddlewareOptions,
} from '../lib/config'


export const jwtConfig: Config = {
  ...initialConfig,
}

export const jwtMiddlewareConfig: Readonly<Omit<JwtMiddlewareConfig, 'match'>> = {
  ...initialMiddlewareConfig,
  ignore: [
    '/',
    '/auth/login',
    '/login',
    '/metrics',
    '/ping',
    '/favicon.ico',
    '/favicon.png',
  ],
  options: {
    ...initMiddlewareOptions,
  },
}

