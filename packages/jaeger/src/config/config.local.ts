import { initialConfig } from '../lib/config'
import { Config } from '../lib/types'


export const tracer: Config = {
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
}
