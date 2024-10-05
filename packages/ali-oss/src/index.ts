
import type { Config, ConfigKey } from './lib/types.js'


export { AutoConfiguration as Configuration } from './configuration.js'
export * from './app/index.controller.js'
export * from './lib/index.js'
export {
  type BaseOptions,
  type Config as OssConfig,
  type DataBase,
  type DataCp,
  type DataSign,
  type DataStat,
  type ProcessRet,
  FnKey,
  OssClient,
} from '@yuntools/ali-oss'


declare module '@midwayjs/core/dist/interface.js' {
  interface MidwayConfig {
    [ConfigKey.config]?: Config
  }
}


