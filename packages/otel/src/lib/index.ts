
export * from './config'
export { OtelComponent } from './component'
export {
  AbstractOtelComponent, AbstractTraceService,
} from './abstract'
export {
  TRACE_KEY,
  Trace,
} from './trace.decorator'
export * from './trace.logger'
export * from './trace.service'
export * from './trace-init/trace-init'
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
  Config as OtelConfig,
  ConfigKey as OtelConfigKey,
  MiddlewareConfig as OtelMiddlewareConfig,
  MiddlewareOptions as OtelMiddlewareOptions,
  Msg as TracerMsg,

  AddEventOtpions,
  AttributesMap,
  HeadersKey,
  InitTraceOptions,
  JaegerTraceInfo,
  JaegerTraceInfoSpan,
  JaegerTraceInfoReferences,
  JaegerTraceInfoLog,
  JaegerTraceInfoLogField,
  SpanExporterList,
  SpanHeaderInit,
  SpanStatusOptions,
  TraceDecoratorArg,
  TraceDecoratorOptions,
  TraceError,
  TraceLogType as LogInfo,
} from './types'


export { AttrNames } from './attrnames.types'

