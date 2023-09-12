import {
  initialConfig,
  initialMiddlewareConfig,
  initOtlpGrpcExporterConfig,
  initTracerIgnoreArray,
} from '##/lib/config.js'
// import { processCustomFailure } from '##/lib/tracer.js'
import { Config, InitTraceOptions, MiddlewareConfig, SpanExporterList } from '##/lib/types.js'


export const otelConfig: Config = {
  ...initialConfig,
  enableDefaultRoute: true,
  exporters: [
    // SpanExporterList.console,
    SpanExporterList.otlpGrpc,
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

