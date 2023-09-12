
export * from './config.js'
export { OtelComponent } from './component.js'
export {
  AbstractOtelComponent, AbstractTraceService,
} from './abstract.js'
export * from './trace.logger.js'
export * from './trace.service.js'
export * from './decorator.trace/trace.js'
export * from './decorator.trace-init/trace-init.js'
export {
  addSpanEventWithOutgoingResponseData,
  getIncomingRequestAttributesFromWebContext,
  genAttributesFromHeader,
  genRequestSpanName,
  normalizeHeaderKey,
  parseResponseStatus,
  propagateHeader,
  propagateOutgoingHeader,
  setResponseContentLengthAttribute,
  setSpanWithRequestHeaders,
  getSpan,
  setSpan,
  deleteSpan,
} from './util.js'

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
  TraceError,
  TraceLogType as LogInfo,
} from './types.js'

export {
  TraceDecoratorParam as TraceDecoratorArg,
  TraceDecoratorOptions,
} from './decorator.types.js'

export { genDecoratorExecutorOptions } from './trace.helper.js'

export { AttrNames } from './attrnames.types.js'

