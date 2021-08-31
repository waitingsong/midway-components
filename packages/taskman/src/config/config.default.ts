import { MiddlewareConfig } from '../index'
import {
  DbReplica,
  initTaskClientConfig,
  initDbConfig,
  TaskClientConfig,
  TaskServerConfig,
  initTaskServerConfig,
  initialMiddlewareConfig,
  initMiddlewareOptions,
} from '../lib/index'


/**
 * Remove this variable if running as client
 */
export const taskServerConfig: TaskServerConfig = {
  ...initTaskServerConfig,
  dataSource: {
    [DbReplica.taskMaster]: {
      ...initDbConfig,
    },
  },
}

export const taskClientConfig: TaskClientConfig = {
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

