
export * from './config'
export { OtelComponent } from './component'
export {
  TRACE_KEY,
  Trace,
  TraceDecoratorOptions,
} from './trace.decorator'
export * from './trace.service'
export {
  addSpanEventWithOutgoingResponseData,
  getIncomingRequestAttributesFromWebContext,
  genAttributesFromHeader,
  genRequestSpanName,
  normalizeHeaderKey,
  parseResponseStatus,
  propagateOutgoingHeader,
  setResponseContentLengthAttribute,
  setSpanWithRequestHeaders,
  getSpan,
  setSpan,
  deleteSpan,
} from './util'

export {
  Config as TracerConfig,
  ConfigKey as TracerConfigKey,
  MiddlewareConfig as TracerMiddlewareConfig,
  MiddlewareOptions as TracerMiddlewareOptions,
  Msg as TracerMsg,

  AttributesMap,
  HeadersKey,
  InitTraceOptions,
  JaegerTraceInfo,
  JaegerTraceInfoSpan,
  JaegerTraceInfoReferences,
  JaegerTraceInfoLog,
  JaegerTraceInfoLogField,
  LogInfo,
  SpanHeaderInit,
  SpanStatusOptions,
  TraceError,
} from './types'


export { AttrNames } from './attrnames.types'

