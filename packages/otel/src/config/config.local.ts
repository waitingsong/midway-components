import {
  initialConfig,
  initialMiddlewareConfig,
  initTracerIgnoreArray,
} from '##/lib/config.js'
import { Config, MiddlewareConfig, SpanExporterList } from '##/lib/types.js'


export const otelConfig: Config = {
  ...initialConfig,
  enableDefaultRoute: true,
  exporters: [
    // SpanExporterList.jaeger,
    // SpanExporterList.console,
    SpanExporterList.otlpGrpc,
  ],
}

export const otelMiddlewareConfig: Readonly<Omit<MiddlewareConfig, 'match'>> = {
  ...initialMiddlewareConfig,
  ignore: [
    ...initTracerIgnoreArray,
    '/untraced_path_string',
    new RegExp('/untraced_path_reg_exp$', 'u'),
  ],
}


