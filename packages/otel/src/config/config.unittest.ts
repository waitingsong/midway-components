import { join } from 'node:path'

import { isFileExists, retrieveDirname } from '@waiting/shared-core'

import {
  initOtlpGrpcExporterConfig,
  initTracerIgnoreArray,
  initialConfig,
  initialMiddlewareConfig,
} from '##/lib/config.js'
// import { processCustomFailure } from '##/lib/tracer.js'
import { PropagatorList, SpanExporterList } from '##/lib/types.js'
import type { Config, InitTraceOptions, MiddlewareConfig } from '##/lib/types.js'


export const keys = Date.now().toString()

export const otelConfig: Config = {
  ...initialConfig,
  enableDefaultRoute: true,
  exporters: [
    // SpanExporterList.console,
    SpanExporterList.otlpGrpc,
  ],
  propagators: [
    PropagatorList.w3cTraceContext,
  ],
}

export const otelMiddlewareConfig: Readonly<Omit<MiddlewareConfig, 'match'>> = {
  ...initialMiddlewareConfig,
  enableMiddleware: true,
  ignore: [
    ...initTracerIgnoreArray,
    '/untraced_path_string',
    new RegExp('/untraced_path_reg_exp$', 'u'),
  ],
}


export const otlpGrpcExporterConfig: InitTraceOptions['otlpGrpcExporterConfig'] = {
  ...initOtlpGrpcExporterConfig,
}
console.info({ otlpGrpcExporterConfig })


const configDir = retrieveDirname(import.meta)
export const APP_BASE_DIR = join(configDir, '../..')
// 调试、单测时指向src目录，其余指向dist目录
export const APP_DIST_DIR = join(configDir, '../')
console.info({ APP_BASE_DIR, APP_DIST_DIR })


const protoPath = join(APP_BASE_DIR, 'test/grpc', 'helloworld.proto')
export const grpcServer = { services: [] }
export const grpc = { services: [] }

if (await isFileExists(protoPath)) {
  // @ts-expect-error
  grpcServer.services.push({ url: 'localhost:6565', protoPath, package: 'helloworld' })
  // @ts-expect-error
  grpc.services.push({ url: 'localhost:6565', protoPath, package: 'helloworld' })
}


