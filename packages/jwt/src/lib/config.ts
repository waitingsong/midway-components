import {
  Config,
  MiddlewareConfig,
  MiddlewareOptions,
} from './types.js'


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
  /\/swagger-ui\/.+(html|json|js|css|png|ico)#?/u,
]

export const schemePrefix = 'Bearer'

export const DECORATOR_KEY_Public = 'decorator_key_jwt:public'

