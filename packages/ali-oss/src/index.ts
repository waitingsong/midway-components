
import { Config, ConfigKey } from './lib/types'


export { AutoConfiguration as Configuration } from './configuration'
export * from './app/index.controller'
export * from './lib/index'

export {
  BaseOptions,
  OssClient,
  ProcessRet,
  DataBase,
  DataCp,
  DataSign,
  DataStat,
  Config as OssConfig,
  FnKey,
} from '@yuntools/ali-oss'


declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    [ConfigKey.config]?: Config
  }
}

