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

