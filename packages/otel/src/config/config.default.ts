import {
  initialConfig,
  initialMiddlewareConfig,
  initOtlpGrpcExporterConfig,
  initTracerIgnoreArray,
} from '../lib/config'
import { Config, InitTraceOptions, MiddlewareConfig } from '../lib/types'


export const keys = Date.now()
export const koa = {
  port: 7001,
}

export const otelConfig: Config = {
  ...initialConfig,
  enableDefaultRoute: false,
}

export const otelMiddlewareConfig: Readonly<Omit<MiddlewareConfig, 'match'>> = {
  ...initialMiddlewareConfig,
  ignore: [...initTracerIgnoreArray],
}

// export const jaegerExporterConfig: InitTraceOptions['jaegerExporterConfig'] = {
//   host: exporterAgentHost,
// }


export const otlpGrpcExporterConfig: InitTraceOptions['otlpGrpcExporterConfig'] = {
  ...initOtlpGrpcExporterConfig,
}
