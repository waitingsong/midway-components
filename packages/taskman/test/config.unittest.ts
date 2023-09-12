import {
  initialMiddlewareConfig,
  initMiddlewareOptions,
  MiddlewareConfig,
  MiddlewareOptions,
} from '##/index.js'
import {
  DbReplica,
  initDbConfig,
  initTaskClientConfig,
  initTaskServerConfig,
  TaskClientConfig,
  TaskServerConfig,
} from '##/lib/index.js'


export const taskClientConfig: TaskClientConfig = {
  ...initTaskClientConfig,
}

/**
 * this variable can be delete if running as client
 */
export const taskServerConfig: TaskServerConfig = {
  ...initTaskServerConfig,
  dataSource: {
    [DbReplica.taskMaster]: {
      ...initDbConfig,
      traceInitConnection: true,
    },
  },
}

export const taskMiddlewareConfig: Readonly<Omit<MiddlewareConfig, 'match'>> = {
  ...initialMiddlewareConfig,
  ignore: [
    '/',
    '/ping',
  ],
  options: {
    ...initMiddlewareOptions,
  },
}

export const mwConfig: Readonly<Omit<MiddlewareConfig, 'match'>> = {
  ...initialMiddlewareConfig,
  ignore: [], // !
  options: {
    ...initMiddlewareOptions,
  },
}

export const mwOptions: MiddlewareOptions = {
  ...initMiddlewareOptions,
}
export const mwConfigNoOpts: Omit<MiddlewareConfig, 'match' | 'ignore' | 'options'> = {
  ...initialMiddlewareConfig,
}

