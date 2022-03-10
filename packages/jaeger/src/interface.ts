import { IMidwayApplication, IMidwayContext } from '@midwayjs/core'
import { Context as KoaContext } from '@midwayjs/koa'

import {
  SpanLogInput,
  TracerManager,
  Config,
} from './lib/index'


export {
  JsonObject,
  JsonResp,
  JsonType,
  NpmPkg,
} from '@waiting/shared-types'

declare module '@midwayjs/core' {
  interface Application {
    jaeger: Config
  }

  interface Context {
    tracerManager: TracerManager
    tracerTags: SpanLogInput
  }
}

export {
  IMidwayApplication,
  IMidwayContainer,
  IMiddleware,
  NextFunction,
} from '@midwayjs/core'
export type Application = IMidwayApplication<Context>
export type Context = IMidwayContext<KoaContext>

// declare module '@midwayjs/core/dist/interface' {
//   // 将配置合并到 MidwayConfig 中
//   interface MidwayConfig {
//     jaeger?: TracerConfig
//   }
// }


