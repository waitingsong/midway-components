
export * from './config'
export { OtelComponent } from './component'
export {
  TRACE_KEY,
  Trace,
  DecoratorArgs,
} from './trace.decorator'
export * from './trace.logger'
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
  TraceLogType as LogInfo,
  SpanHeaderInit,
  SpanStatusOptions,
  TraceError,
} from './types'


export { AttrNames } from './attrnames.types'

