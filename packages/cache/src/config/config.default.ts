import {
  initConfig,
  initialMiddlewareConfig,
  initMiddlewareOptions,
} from '../lib/config'
import {
  Config,
  MiddlewareConfig,
} from '../lib/types'


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

