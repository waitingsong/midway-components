import { MiddlewareConfig } from '../index'
import {
  initTaskClientConfig,
  initDbConfig,
  TaskClientConfig,
  TaskServerConfig,
  initTaskServerConfig,
  initialMiddlewareConfig,
  initMiddlewareOptions,
} from '../lib/index'


export const taskClientConfig: TaskClientConfig = {
  ...initTaskClientConfig,
}

/**
 * this variable can be delete if running as client
 */
export const taskServerConfig: TaskServerConfig = {
  ...initTaskServerConfig,
  dbConfigs: {
    ...initDbConfig,
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

