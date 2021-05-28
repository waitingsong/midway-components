
import {
  AliOssSourceConfig,
  ConfigKey,
} from './lib/index'


export { AutoConfiguration as Configuration } from './configuration'
export * from './lib/index'


declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    [ConfigKey.config]: AliOssSourceConfig
  }
}

