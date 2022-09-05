import { initialConfig } from '../lib/config'
import { Config } from '../lib/types'


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

