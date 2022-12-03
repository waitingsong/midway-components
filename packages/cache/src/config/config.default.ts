import {
  Config,
  MiddlewareConfig,
} from '../index'
import {
  initConfig,
  initialMiddlewareConfig,
  initMiddlewareOptions,
} from '../lib/config'


export const cacheConfig: Config = {
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

