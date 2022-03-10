import { processCustomFailure } from '../middleware/helper'

import {
  Config,
  MiddlewareConfig,
  MiddlewareOptions,
} from './types'


export const initialConfig: Readonly<Omit<Config, 'tracingConfig'>> = {
  whiteList: [
    '/favicon.ico',
    '/favicon.png',
  ],
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

export const enum ConfigKey {
  namespace = 'jaeger',
  config = 'jaegerConfig',
  middlewareConfig = 'jaegerMiddlewareConfig',
  componentName = 'jaegerComponent',
  middlewareName = 'jaegerMiddleware'
}


