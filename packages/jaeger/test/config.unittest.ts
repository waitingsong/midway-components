import {
  Config,
  initialMiddlewareConfig,
  initMiddlewareOptions,
  MiddlewareConfig,
  MiddlewareOptions,
  initialConfig,
} from '~/index'
import { processCustomFailure } from '~/lib/tracer'


export const config: Config = {
  ...initialConfig,
  processCustomFailure,
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

export const mwConfig: Readonly<Omit<MiddlewareConfig, 'match'>> = {
  ...initialMiddlewareConfig,
  ignore: [
    '/untraced_path_string',
    new RegExp('/untraced_path_reg_exp$', 'u'),
  ],
  options: {
    ...initMiddlewareOptions,
  },
}

export const mwOptions: MiddlewareOptions = {
  ...initMiddlewareOptions,
}
export const mwConfigNoOpts: Omit<MiddlewareConfig, 'match' | 'ignore' | 'options'> = {
  ...initialMiddlewareConfig,
}

