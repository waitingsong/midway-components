import { processCustomFailure } from './helper'
import {
  Config,
  MiddlewareConfig,
  MiddlewareOptions,
} from './types'


export const initialConfig: Readonly<Omit<Config, 'tracingConfig'>> = {
  reqThrottleMsForPriority: 500,
  enableCatchError: true,
  logginInputQuery: true,
  loggingOutputBody: true,
  loggingReqHeaders: [
    'authorization',
    'host',
    'user-agent',
  ],
  processCustomFailure,
}
export const initMiddlewareOptions: MiddlewareOptions = {
  debug: false,
}
export const initialMiddlewareConfig: Readonly<Omit<MiddlewareConfig, 'ignore' | 'match' | 'options'>> = {
  enableMiddleware: true,
}

export enum ConfigKey {
  namespace = 'jaeger',
  config = 'tracerConfig',
  middlewareConfig = 'tracerMiddlewareConfig',
  componentName = 'tracerComponent',
  middlewareName = 'tracerMiddleware',
  extMiddlewareName = 'tracerExtMiddleware'
}


