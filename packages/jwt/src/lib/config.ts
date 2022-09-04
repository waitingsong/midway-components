import {
  Config,
  MiddlewareConfig,
  MiddlewareOptions,
} from './types'


export const initialConfig: Readonly<Config> = {
  enableDefaultRoute: false,
  secret: '',
}
export const initMiddlewareOptions: MiddlewareOptions = {
  debug: false,
  cookie: false,
  passthrough: false,
}
export const initialMiddlewareConfig: Readonly<Omit<MiddlewareConfig, 'ignore' | 'match'>> = {
  enableMiddleware: true,
  options: {
    debug: false,
    cookie: false,
    passthrough: false,
  },
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

export const schemePrefix = 'Bearer'

