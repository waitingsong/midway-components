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
        ...serverConfig.dbConfigs.connection,
      },
      acquireConnectionTimeout: serverConfig.dbConfigs.acquireConnectionTimeout
        ? serverConfig.dbConfigs.acquireConnectionTimeout
        : defaultDbConfig.acquireConnectionTimeout,
      postProcessResponse,
      wrapIdentifier,
    },
    dict: dbDict,
    enableTracing: serverConfig.dbConfigs.enableTracing ?? defaultDbConfig.enableTracing,
    sampleThrottleMs: serverConfig.dbConfigs.sampleThrottleMs ?? defaultDbConfig.sampleThrottleMs,
  }

  const kmoreConfig: KmoreComponentConfig = {
    dbConfigs: {
      [DbReplica.taskMaster]: master,
    },
  }

  return kmoreConfig
}

