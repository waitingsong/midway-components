import type { PrometheusConfig } from '@midwayjs/prometheus'
import type { JwtState } from '@mwcp/jwt'


export { ContainerConfiguration as Configuration } from './configuration.js'
export * from './app/index.controller.js'
export * from './lib/index.js'
export * from './middleware/index.middleware.js'
export { RootClass } from './core/root.class.js'


// @ts-ignore
declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    globalErrorCode: Record<string | number, string | number>
    prometheus?: PrometheusConfig
    welcomeMsg: string
  }
}

// @ts-ignore
declare module '@midwayjs/koa/dist/interface' {
  interface Context {
    jwtState: JwtState
    reqId: string
  }
}

export {
  MyError,
  shouldEnableMiddleware,
} from '@mwcp/share'


