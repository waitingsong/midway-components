import {
  initialMiddlewareConfig,
  initMiddlewareOptions,
  MiddlewareConfig,
  DbReplica,
  initDbConfig,
  initTaskClientConfig,
  initTaskServerConfig,
  TaskClientConfig,
  TaskServerConfig,
} from '##/lib/index.js'


export const enableJsonRespMiddlewareConfig = false

/**
 * this variable can be delete if running as client
 */
export const taskServerConfig: TaskServerConfig = {
  ...initTaskServerConfig,
  dataSource: {
    [DbReplica.taskMaster]: {
      ...initDbConfig,
    },
  },
}

export const taskClientConfig: Omit<TaskClientConfig, 'supportTaskMap'> = {
  ...initTaskClientConfig,
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

