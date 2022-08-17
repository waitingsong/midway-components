import type { PrometheusConfig } from '@midwayjs/prometheus'


export * from './lib/index.js'


// @ts-ignore
declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    prometheus?: PrometheusConfig
  }
}

