import {
  DbConfig as KmoreDbConfig,
  postProcessResponse,
  wrapIdentifier,
} from '@mw-components/kmore'

import {
  dbDict,
  DbConfig,
  DbModel,
  TaskManServerConfig,
} from '../lib/index'


export function genKmoreDbConfig(
  serverConfig: TaskManServerConfig,
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
      postProcessResponse,
      wrapIdentifier,
    },
    dict: dbDict,
    enableTracing: serverConfig.dbConfigs.enableTracing ?? defaultDbConfig.enableTracing,
    tracingResponse: true,
    sampleThrottleMs: serverConfig.dbConfigs.sampleThrottleMs ?? defaultDbConfig.sampleThrottleMs,
  }

  return master
}

