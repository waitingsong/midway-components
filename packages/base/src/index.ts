import type { PrometheusConfig } from '@midwayjs/prometheus'


export { ContainerConfiguration as Configuration } from './configuration'
export * from './lib/index'
export * from './middleware/index.middleware'
export { RootClass } from './core/root.class'


// @ts-ignore
declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    prometheus?: PrometheusConfig
  }
}

