import {
  initialConfig,
  initialMiddlewareConfig,
  initTracerIgnoreArray,
} from '../lib/config'
// import { processCustomFailure } from '../lib/tracer'
import { Config, MiddlewareConfig, SpanExporterList } from '../lib/types'


export const otelConfig: Config = {
  ...initialConfig,
  enableDefaultRoute: true,
  spanExporters: [
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

