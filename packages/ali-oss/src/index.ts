
import type { Config, ConfigKey } from './lib/types.js'


export { AutoConfiguration as Configuration } from './configuration.js'
export * from './app/index.controller.js'
export * from './lib/index.js'
export {
  type BaseOptions,
  OssClient,
  type ProcessRet,
  type DataBase,
  type DataCp,
  type DataSign,
  type DataStat,
  type Config as OssConfig,
  FnKey,
} from '@yuntools/ali-oss'


// @ts-ignore
declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    [ConfigKey.config]?: Config
  }
}


