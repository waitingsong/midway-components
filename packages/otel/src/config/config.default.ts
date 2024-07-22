import {
  initialConfig,
  initialMiddlewareConfig,
  initOtlpGrpcExporterConfig,
  initTracerIgnoreArray,
} from '##/lib/config.js'
import type { Config, InitTraceOptions, MiddlewareConfig } from '##/lib/types.js'


export const koa = {
  port: 7001,
}

export const otelConfig: Config = {
  ...initialConfig,
  enableDefaultRoute: true,
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

export const asyncContextManager = {
  enable: true,
}

