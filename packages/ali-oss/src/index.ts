
import {
  Config,
  ConfigKey,
} from './lib/index'


export { AutoConfiguration as Configuration } from './configuration'
export * from './lib/index'


// @ts-ignore
declare module '@midwayjs/core/dist/interface' {
  interface MidwayConfig {
    [ConfigKey.config]: Config
  }
}

