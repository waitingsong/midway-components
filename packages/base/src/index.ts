import type { PrometheusConfig } from '@midwayjs/prometheus'
import type { JwtState } from '@mwcp/jwt'


export { ContainerConfiguration as Configuration } from './configuration'
export * from './app/index.controller'
export * from './lib/index'
export * from './middleware/index.middleware'
export { RootClass } from './core/root.class'


declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    globalErrorCode: Record<string | number, string | number>
    prometheus?: PrometheusConfig
    welcomeMsg: string
  }
}

declare module '@midwayjs/koa/dist/interface' {
  interface Context {
    jwtState: JwtState
    reqId: string
  }
}

