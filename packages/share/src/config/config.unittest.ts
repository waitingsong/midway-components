import { initialConfig, initialMiddlewareConfig } from '../lib/config.js'
import type { Config, MiddlewareConfig, MiddlewareOptions } from '../lib/types.js'


export const keys = 123456

export const shareConfig: Readonly<Config> = {
  ...initialConfig,
  enableDefaultRoute: true,
}

export const shareMiddlewareConfig: Readonly<Omit<MiddlewareConfig<MiddlewareOptions>, 'match'>> = {
  ...initialMiddlewareConfig,
  enableMiddleware: true,
  ignore: [
    '/',
    '/ping',
    '/favicon.ico',
    '/favicon.png',
    '/_info',
  ],
}

/**
 * @see ../middleware/json-response.middleware.ts
 */
export const enableJsonRespMiddlewareConfig = true
