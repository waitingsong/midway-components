import { TracerConfig } from '../lib/types'


export const tracer: TracerConfig = {
  whiteList: ['/favicon.ico', '/favicon.png'],
  reqThrottleMsForPriority: 150,
  enableMiddleWare: true,
  enableCatchError: true,
  logginInputQuery: false,
  loggingOutputBody: false,
  loggingReqHeaders: [
    'authorization',
    'user-agent',
  ],
  tracingConfig: {
    sampler: {
      type: 'probabilistic',
      param: 0.0001,
    },
    reporter: {
      agentHost: '127.0.0.1',
    },
  },
}
