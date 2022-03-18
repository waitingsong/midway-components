import { IMidwayApplication, IMidwayContext } from '@midwayjs/core'
import { Context as KoaContext } from '@midwayjs/koa'

import {
  ConfigKey,
  MiddlewareConfig,
  TaskClientConfig,
  TaskServerConfig,
} from './lib/index'


export { TracerLog } from '@mw-components/jaeger'
export {
  JsonObject,
  JsonResp,
  JsonType,
  NpmPkg,
} from '@waiting/shared-types'
declare module '@midwayjs/core/dist/interface' {
  // 将配置合并到 MidwayConfig 中
  interface MidwayConfig {
    [ConfigKey.clientConfig]: TaskClientConfig
    [ConfigKey.serverConfig]: TaskServerConfig
    [ConfigKey.middlewareConfig]: MiddlewareConfig
  }
}


export {
  IMidwayApplication,
  IMidwayContainer,
  IMiddleware,
  MidwayInformationService,
  NextFunction,
} from '@midwayjs/core'
export type Application = IMidwayApplication<Context>
export type Context = IMidwayContext<KoaContext>

export type { Options as FetchOptions } from '@mw-components/fetch'

export { IPostgresInterval } from 'postgres-interval'

