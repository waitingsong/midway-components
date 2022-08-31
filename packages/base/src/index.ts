import type { PrometheusConfig } from '@midwayjs/prometheus'
import type { JwtState } from '@mwcp/jwt'
import type { Config as KoidConfig } from '@mwcp/koid'


export { ContainerConfiguration as Configuration } from './configuration'
export * from './lib/index'
export * from './middleware/index.middleware'
export { RootClass } from './core/root.class'


declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    globalErrorCode: Record<string | number, string | number>
    koidConfig: KoidConfig
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
