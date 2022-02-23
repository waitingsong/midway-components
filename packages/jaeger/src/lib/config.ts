import { processCustomFailure } from '../middleware/helper'

import { TracerConfig } from './types'


export const namespace = 'jaeger'
export const compName = `${namespace}Component`

export const defaultTracerConfig: Omit<TracerConfig, 'tracingConfig'> = {
  whiteList: ['/favicon.ico', '/favicon.png'],
  reqThrottleMsForPriority: 500,
  enableMiddleWare: true,
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
