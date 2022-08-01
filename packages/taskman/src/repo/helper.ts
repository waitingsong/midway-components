import {
  DbConfig,
  KnexConfig,
  postProcessResponseToCamel,
  wrapIdentifier,
} from '@mw-components/kmore'

import {
  dbDict,
  DbModel,
  TaskServerConfig,
  DbReplica,
} from '../lib/index'


export function genKmoreDbConfig(
  serverConfig: TaskServerConfig,
  defaultDbConfig: Required<DbConfig>,
): DbConfig<DbModel> {

  const serverDataSource = serverConfig.dataSource[DbReplica.taskMaster]
  const enableTracing = serverDataSource.enableTracing ?? defaultDbConfig.enableTracing ?? false
  const sampleThrottleMs = serverDataSource['sampleThrottleMs'] ?? defaultDbConfig.sampleThrottleMs ?? 1000

  const acquireConnectionTimeout = (serverDataSource.config.acquireConnectionTimeout
    ? serverDataSource.config.acquireConnectionTimeout
    : defaultDbConfig.config.acquireConnectionTimeout) ?? 60000

  const connection = {
    ...typeof defaultDbConfig.config.connection === 'object' ? defaultDbConfig.config.connection : {},
    ...typeof serverDataSource.config === 'object' ? serverDataSource.config : {},
  }

  const pool = {
    ...defaultDbConfig.config.pool,
    ...serverDataSource.config.pool,
  }

  const knexConfig: KnexConfig = {
    client: 'pg',
    connection,
    acquireConnectionTimeout,
    pool,
    // serverConfig.dbConfigs.pool
    postProcessResponse: postProcessResponseToCamel,
    wrapIdentifier,
  }

  const master: DbConfig<DbModel> = {
    config: knexConfig,
    dict: dbDict,
    enableTracing,
    tracingResponse: true,
    sampleThrottleMs,
  }


  return master
}

