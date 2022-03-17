import {
  initialMiddlewareConfig,
  initMiddlewareOptions,
  MiddlewareConfig,
  MiddlewareOptions,
} from '~/index'


export {
  taskMiddlewareConfig as mwConfig,
  taskClientConfig,
  taskServerConfig,
} from '~/config/config.unittest'

export const mwOptions: MiddlewareOptions = {
  ...initMiddlewareOptions,
}
export const mwConfigNoOpts: Omit<MiddlewareConfig, 'match' | 'ignore' | 'options'> = {
  ...initialMiddlewareConfig,
}

