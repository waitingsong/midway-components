import { MidwayConfig } from '@midwayjs/core'
import type { PrometheusConfig } from '@midwayjs/prometheus'


export * from './lib/middleware.js'
export * from './lib/my-error.js'


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

export {
  IMidwayApplication,
  IMidwayContainer,
  IMiddleware,
  NextFunction,
} from '@midwayjs/core'

export type AppConfig = Partial<MidwayConfig>
export {
  Application,
  Context,
} from '@midwayjs/koa'

