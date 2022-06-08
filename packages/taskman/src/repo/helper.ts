import {
  DbConfig as KmoreDbConfig,
  postProcessResponseToCamel,
  wrapIdentifier,
} from '@mw-components/kmore'

import {
  dbDict,
  DbConfig,
  DbModel,
  TaskServerConfig,
} from '../lib/index'


export function genKmoreDbConfig(
  serverConfig: TaskServerConfig,
  defaultDbConfig: Required<DbConfig>,
): KmoreDbConfig<DbModel> {

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
      pool: {
        ...defaultDbConfig.pool,
        ...serverConfig.dbConfigs.pool,
      },
      // serverConfig.dbConfigs.pool
      postProcessResponse: postProcessResponseToCamel,
      wrapIdentifier,
    },
    dict: dbDict,
    enableTracing: serverConfig.dbConfigs.enableTracing ?? defaultDbConfig.enableTracing,
    tracingResponse: true,
    sampleThrottleMs: serverConfig.dbConfigs.sampleThrottleMs ?? defaultDbConfig.sampleThrottleMs,
  }


  return master
}

