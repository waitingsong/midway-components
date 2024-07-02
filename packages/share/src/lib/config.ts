import type { Config, MiddlewareConfig, MiddlewareOptions } from './types.js'


export const initialConfig: Readonly<Config> = {
  enableDefaultRoute: false,
}
export const initMiddlewareOptions: MiddlewareOptions = {
  debug: false,
}
export const initialMiddlewareConfig: Readonly<Omit<MiddlewareConfig<MiddlewareOptions>, 'ignore' | 'match' | 'options'>> = {
  enableMiddleware: false,
}


