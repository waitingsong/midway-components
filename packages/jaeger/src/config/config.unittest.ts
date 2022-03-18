import { Config, MiddlewareConfig } from '../index'
import {
  initialConfig,
  initialMiddlewareConfig,
} from '../lib/config'


export const tracerConfig: Config = {
  ...initialConfig,
  tracingConfig: {
    // serviceName: 'jaeger',
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
  ignore: [
    '/untraced_path_string',
    new RegExp('/untraced_path_reg_exp$', 'u'),
  ],
}

