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


export const keys = Math.random().toString()

export const koa = {
  port: 7001,
}

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

