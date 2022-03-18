import { Node_Headers } from '@mw-components/fetch'
import { HeadersKey } from '@mw-components/jaeger'
import {
  DbConfig as KmoreDbConfig,
  postProcessResponse,
  wrapIdentifier,
} from '@mw-components/kmore'
import { defaultPropDescriptor } from '@waiting/shared-core'

import {
  dbDict,
  DbConfig,
  DbModel,
  TaskServerConfig,
} from '../lib/index'

import { CreateTaskOptions } from './types'

import { Context } from '~/interface'



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


export function processJsonHeaders(
  ctx: Context,
  inputJsonHeaders: CreateTaskOptions['createTaskDTO']['json']['headers'],
  fetchHeaders: Headers,
): Record<string, string> {

  const jsonHeaders: Record<string, string> = {}

  const tmpHeaders = inputJsonHeaders
    ? new Node_Headers(inputJsonHeaders)
    : fetchHeaders
  // headers is a map, which will lost after JSON.stringify()
  tmpHeaders.forEach((value, key) => {
    Object.defineProperty(jsonHeaders, key, {
      ...defaultPropDescriptor,
      value,
    })
  })

  if (typeof ctx.reqId === 'string' && ctx.reqId && typeof jsonHeaders[HeadersKey.reqId] === 'undefined') {
    Object.defineProperty(jsonHeaders, HeadersKey.reqId, {
      ...defaultPropDescriptor,
      value: ctx.reqId,
    })
  }
  return jsonHeaders
}
