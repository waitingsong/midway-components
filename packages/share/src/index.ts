import type { PrometheusConfig } from '@midwayjs/prometheus'


export * from './lib/middleware.js'
export * from './lib/my-error.js'
export * from './lib/types.js'


// @ts-ignore
declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    prometheus?: PrometheusConfig
  }
}
// @ts-ignore
declare module '@midwayjs/koa/dist/interface' {
  interface Context {
    reqId: string
    _internalError?: Error
  }
}


