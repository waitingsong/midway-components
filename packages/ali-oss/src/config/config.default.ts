import { initialConfig } from '../lib/config.js'
import { Config } from '../lib/types.js'


export const keys = Date.now()
export const koa = {
  port: 7001,
}

export const aliOssConfig: Readonly<Config> = {
  enableDefaultRoute: false,
  dataSource: {},
  default: {
    ...initialConfig,
  },
}

