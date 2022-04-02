import {
  Config,
  initialMiddlewareConfig,
  initMiddlewareOptions,
  MiddlewareConfig,
  MiddlewareOptions,
  initialConfig,
} from '~/index'


<<<<<<<< HEAD:packages/taskman/test/test.config.ts
export {
  taskMiddlewareConfig as mwConfig,
  taskClientConfig,
  taskServerConfig,
} from '~/config/config.unittest'
========
export const config: Config = {
  ...initialConfig,
}

export const mwConfig: Readonly<Omit<MiddlewareConfig, 'match'>> = {
  ...initialMiddlewareConfig,
  ignore: [], // !
  options: {
    ...initMiddlewareOptions,
  },
}
>>>>>>>> bp/main:packages/taskman/test/config.unittest.ts

export const mwOptions: MiddlewareOptions = {
  ...initMiddlewareOptions,
}
export const mwConfigNoOpts: Omit<MiddlewareConfig, 'match' | 'ignore' | 'options'> = {
  ...initialMiddlewareConfig,
}

