

export const config = {
  tracingConfig: {
    serviceName: 'jaeger-ut',
    sampler: {
      type: 'probabilistic',
      param: 1,
    },
    reporter: {
      agentHost: '127.0.0.1',
    },
  },
}

