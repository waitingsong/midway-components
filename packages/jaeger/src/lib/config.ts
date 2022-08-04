import {
  Config,
  MiddlewareConfig,
  MiddlewareOptions,
  TracerTag,
} from './types'

/**
 * Initial config, contains:
 * - authorization
 * - host
 * - user-agent
 */
export const initLoggingReqHeaders: Readonly<string[]> = [
  'authorization',
  'host',
  'user-agent',
  TracerTag.svcName,
  TracerTag.svcVer,
]

export const initialConfig: Readonly<Omit<Config, 'tracingConfig'>> = {
  reqThrottleMsForPriority: 500,
  enableCatchError: true,
  logginInputQuery: true,
  loggingOutputBody: true,
  loggingReqHeaders: [...initLoggingReqHeaders],
}
export const initMiddlewareOptions: MiddlewareOptions = {
  debug: false,
}
export const initialMiddlewareConfig: Readonly<Omit<MiddlewareConfig, 'ignore' | 'match' | 'options'>> = {
  enableMiddleware: true,
}

export const initTracerIgnoreArray: Readonly<(string|RegExp)[]> = [
  '/favicon.ico',
  '/favicon.png',
  '/ping',
  '/metrics',
  '/untracedPath',
  /\/unitTest[\d.]+/u,
]

export enum ConfigKey {
  namespace = 'jaeger',
  config = 'tracerConfig',
  middlewareConfig = 'tracerMiddlewareConfig',
  componentName = 'tracerComponent',
  middlewareName = 'tracerMiddleware',
  extMiddlewareName = 'tracerExtMiddleware'
}


