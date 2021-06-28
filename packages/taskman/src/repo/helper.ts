import {
  DbConfig as KmoreDbConfig,
  KmoreComponentConfig,
  postProcessResponse,
  wrapIdentifier,
} from '@mw-components/kmore'

import {
  dbDict,
  DbConfig,
  DbModel,
  DbReplica,
  TaskManServerConfig,
} from '../lib/index'


export function genKmoreComponentConfig(
  serverConfig: TaskManServerConfig,
  defaultDbConfig: Required<DbConfig>,
): KmoreComponentConfig {

  const master: KmoreDbConfig<DbModel> = {
    autoConnect: true,
    config: {
      client: 'pg',
      connection: {
        ...defaultDbConfig.connection,
        ...serverConfig.database.connection,
      },
      acquireConnectionTimeout: serverConfig.database.acquireConnectionTimeout
        ? serverConfig.database.acquireConnectionTimeout
        : defaultDbConfig.acquireConnectionTimeout,
      postProcessResponse,
      wrapIdentifier,
    },
    dict: dbDict,
    enableTracing: serverConfig.database.enableTracing ?? defaultDbConfig.enableTracing,
    sampleThrottleMs: serverConfig.database.sampleThrottleMs ?? defaultDbConfig.sampleThrottleMs,
  }
  const kmoreConfig: KmoreComponentConfig = {
    database: {
      [DbReplica.taskMaster]: master,
    },
  }

  return kmoreConfig
}

