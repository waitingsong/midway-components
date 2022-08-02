import assert from 'node:assert'

import { Context } from '@midwayjs/core'
import {
  DbConfig,
  KnexConfig,
} from '@mw-components/kmore'

import {
  dbDict,
  DbModel,
  TaskServerConfig,
  DbReplica,
} from '../lib/index'


export function genKmoreDbConfig(
  serverConfig: TaskServerConfig,
  defaultDbConfig: DbConfig,
): DbConfig<DbModel, Context> {

  const serverDataSource = serverConfig.dataSource[DbReplica.taskMaster]
  const enableTracing = serverDataSource.enableTracing ?? defaultDbConfig.enableTracing ?? false
  const sampleThrottleMs = serverDataSource['sampleThrottleMs'] ?? defaultDbConfig.sampleThrottleMs ?? 1000

  const acquireConnectionTimeout = (serverDataSource.config.acquireConnectionTimeout
    ? serverDataSource.config.acquireConnectionTimeout
    : defaultDbConfig.config.acquireConnectionTimeout) ?? 60000

  let connection: KnexConfig['connection'] = defaultDbConfig.config.connection
  if (typeof serverDataSource.config.connection === 'object'
    && Object.keys(serverDataSource.config.connection).length) {
    if (typeof connection === 'object') {
      // @ts-expect-error
      connection = {
        ...connection,
        ...serverDataSource.config.connection,
      }
    }
    else {
      connection = serverDataSource.config.connection
    }
  }
  assert(connection, 'value of connection undefined')

  const pool: KnexConfig['pool'] = {
    ...defaultDbConfig.config.pool,
    ...serverDataSource.config.pool,
  }

  const knexConfig: KnexConfig = {
    client: 'pg',
    connection,
    acquireConnectionTimeout,
    pool,
    // serverConfig.dbConfigs.pool
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

