import {
  initTaskManClientConfig,
  TaskManClientConfig,
  TaskManServerConfig,
} from '../lib/index'


/**
 * Remove this variable if running as client
 */
export const taskManServerConfig: TaskManServerConfig = {
  expInterval: '30min',
  dbConfigs: {
    connection: {
      host: process.env.POSTGRES_HOST ? process.env.POSTGRES_HOST : 'localhost',
      port: process.env.POSTGRES_PORT ? +process.env.POSTGRES_PORT : 5432,
      database: process.env.POSTGRES_DB ? process.env.POSTGRES_DB : 'db_ci_test',
      user: process.env.POSTGRES_USER ? process.env.POSTGRES_USER : 'postgres',
      password: process.env.POSTGRES_PASSWORD ? process.env.POSTGRES_PASSWORD : 'postgres',
    },
    pool: {
      min: 2,
      max: 20,
    },
  },
  headerKey: 'x-task-agent',
  headerKeyTaskId: 'x-task-id',
}

export const taskManClientConfig: TaskManClientConfig = {
  ...initTaskManClientConfig,
}


