import { IMidwayContext } from '@midwayjs/core'
import { Context as KoaContext } from '@midwayjs/koa'

import { SpanLogInput, TracerManager, TracerConfig } from './lib/index'


export {
  JsonObject,
  JsonResp,
  JsonType,
} from '@waiting/shared-types'

declare module '@midwayjs/core' {
  interface Application {
    jaeger: TracerConfig
  }

  interface Context {
    tracerManager: TracerManager
    tracerTags: SpanLogInput
  }
}

export {
  IMidwayApplication as Application,
  IMiddleware, NextFunction,
} from '@midwayjs/core'
export type Context = IMidwayContext<KoaContext>

export { NpmPkg } from '@waiting/shared-types'

// declare module '@midwayjs/core/dist/interface' {
//   // 将配置合并到 MidwayConfig 中
//   interface MidwayConfig {
//     jaeger?: TracerConfig
//   }
// }


