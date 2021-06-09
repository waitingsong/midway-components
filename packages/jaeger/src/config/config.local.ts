import { TracerConfig } from '../lib/types'


export const tracer: TracerConfig = {
  whiteList: ['/favicon.ico', '/favicon.png'],
  reqThrottleMsForPriority: 10,
  enableMiddleWare: true,
  enableCatchError: true,
  isLogginInputQuery: true,
  isLoggingOutputBody: true,
  loggingReqHeaders: [
    'authorization',
    'user-agent',
  ],
  tracingConfig: {
    sampler: {
      type: 'probabilistic',
      param: 1,
    },
    reporter: {
      agentHost: '127.0.0.1',
    },
  },
}
