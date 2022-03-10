import { Config } from '../index'
import { initialConfig } from '../lib/config'


export const tracerConfig: Config = {
  ...initialConfig,
  tracingConfig: {
    serviceName: 'jaeger',
    sampler: {
      type: 'probabilistic',
      param: 1,
    },
    reporter: {
      agentHost: '127.0.0.1',
    },
  },
  whiteList: [],
}


