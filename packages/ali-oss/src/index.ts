
import {
  Config,
  ConfigKey,
} from './lib/types.js'


export { AutoConfiguration as Configuration } from './configuration.js'
export * from './app/index.controller.js'
export * from './lib/index.js'
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


// @ts-ignore
declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    [ConfigKey.config]?: Config
  }
}


