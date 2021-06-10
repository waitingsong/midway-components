import { TracerConfig } from './types'


export const defaultTracerConfig: Omit<TracerConfig, 'tracingConfig'> = {
  whiteList: ['/favicon.ico', '/favicon.png'],
  reqThrottleMsForPriority: 200,
  enableMiddleWare: true,
  enableCatchError: true,
  logginInputQuery: true,
  loggingOutputBody: false,
  loggingReqHeaders: [
    'authorization',
    'user-agent',
  ],
}
