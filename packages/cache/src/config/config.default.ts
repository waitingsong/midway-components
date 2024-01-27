import {
  initConfig,
  initialMiddlewareConfig,
  initMiddlewareOptions,
} from '../lib/config.js'
import {
  Config,
  MiddlewareConfig,
} from '../lib/types.js'


export const koa = {
  port: 7001,
}

export const cacheConfig: Config = {
  enableDefaultRoute: false,
  store: initConfig.store,
  options: {
    ...initConfig.options,
  },
}

export const kmoreMiddlewareConfig: Readonly<Omit<MiddlewareConfig, 'match'>> = {
  ...initialMiddlewareConfig,
  ignore: [],
  options: {
    ...initMiddlewareOptions,
  },
}

