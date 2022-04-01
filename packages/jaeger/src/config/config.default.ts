import { Config, MiddlewareConfig } from '../index'
import {
  initialConfig,
  initialMiddlewareConfig,
} from '../lib/config'
import { processCustomFailure } from '../lib/tracer'


export const tracerConfig: Config = {
  ...initialConfig,
  processCustomFailure,
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

export const tracerMiddlewareConfig: Readonly<Omit<MiddlewareConfig, 'match'>> = {
  ...initialMiddlewareConfig,
  ignore: [
    '/favicon.ico',
    '/favicon.png',
  ],
}

