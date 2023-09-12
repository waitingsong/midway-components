
import {
  initialConfig,
  initialMiddlewareConfig,
  initMiddlewareOptions,
  initPathArray,
} from '##/lib/config.js'
import { Config, MiddlewareConfig } from '##/lib/types.js'


export const keys = Date.now()
export const koa = {
  port: 7001,
}


export const jwtConfig: Config = {
  ...initialConfig,
}

export const jwtMiddlewareConfig: Readonly<Omit<MiddlewareConfig, 'match'>> = {
  ...initialMiddlewareConfig,
  ignore: [...initPathArray],
  options: {
    ...initMiddlewareOptions,
    cookie: false,
    passthrough: false,
  },
}

