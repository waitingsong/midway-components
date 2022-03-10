import { Config } from '../index'
import { initialConfig } from '../lib/config'


export const tracerConfig: Config = {
  ...initialConfig,
  tracingConfig: {
    sampler: {
      type: 'probabilistic',
      param: 1,
    },
    reporter: {
      agentHost: '127.0.0.1',
    },
  },
  whiteList: [
    '/untraced_path_string',
    new RegExp('/untraced_path_reg_exp$', 'u'),
  ],
}


