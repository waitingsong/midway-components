import {
  initTaskManClientConfig,
  initDbConfig,
  TaskManClientConfig,
  TaskManServerConfig,
} from '../lib/index'


/**
 * Remove this variable if running as client
 */
export const taskManServerConfig: TaskManServerConfig = {
  expInterval: '30min',
  dbConfigs: {
    ...initDbConfig,
  },
  headerKey: 'x-task-agent',
  headerKeyTaskId: 'x-task-id',
}

export const taskManClientConfig: TaskManClientConfig = {
  ...initTaskManClientConfig,
}


