import {
  initialConfig,
  initialMiddlewareConfig,
  initTracerIgnoreArray,
} from '../lib/config'
import { processCustomFailure } from '../lib/tracer'
import { Config, MiddlewareConfig } from '../lib/types'


export const tracerConfig: Config = {
  ...initialConfig,
  processCustomFailure,
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

export const tracerMiddlewareConfig: Readonly<Omit<MiddlewareConfig, 'match'>> = {
  ...initialMiddlewareConfig,
  enableMiddleware: true,
  ignore: [
    ...initTracerIgnoreArray,
    '/untraced_path_string',
    new RegExp('/untraced_path_reg_exp$', 'u'),
  ],
}

