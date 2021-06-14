import { defaultTracerConfig } from '../lib/config'
import { TracerConfig } from '../lib/types'


export const tracer: TracerConfig = {
  ...defaultTracerConfig,
  loggingOutputBody: true,
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
