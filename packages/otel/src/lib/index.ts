
export * from './config.js'
export { OtelComponent } from './component.js'
export { DecoratorHandlerTrace } from './decorator.trace/trace.decorator-handler.js'
export { DecoratorHandlerTraceInit } from './decorator.trace-init/trace-init.decorator-handler.js'
export { DecoratorHandlerTraceLog } from './decorator.trace-log/trace-log.decorator-handler.js'

export * from './trace.logger.js'
export * from './trace.service/index.trace.service.js'
export * from './decorator.trace/trace.js'
export * from './decorator.trace-init/trace-init.js'
export * from './decorator.trace-log/trace-log.js'
export * from './reg-decorator.js'
export {
  addSpanEventWithOutgoingResponseData,
  deleteSpan,
  genAttributesFromHeader,
  getIncomingRequestAttributesFromWebContext,
  genRequestSpanName,
  getSpan,
  normalizeHeaderKey,
  parseResponseStatus,
  propagateHeader,
  propagateOutgoingHeader,
  setSpan,
  setResponseContentLengthAttribute,
  setSpanWithRequestHeaders,
} from './util.js'

export {
  type Config as OtelConfig,
  ConfigKey as OtelConfigKey,
  type MiddlewareConfig as OtelMiddlewareConfig,
  type MiddlewareOptions as OtelMiddlewareOptions,
  Msg as TracerMsg,

  type Attributes,
  type AddEventOptions,
  type AttributesMap,
  type InitTraceOptions,
  type JaegerTraceInfo,
  type JaegerTraceInfoSpan,
  type JaegerTraceInfoReferences,
  type JaegerTraceInfoLog,
  type JaegerTraceInfoLogField,
  type SpanHeaderInit,
  type SpanStatusOptions,
  type TraceError,
  type TraceLogType as LogInfo,
  type TraceScopeParamType,
  type TraceScopeType,
  HeadersKey,
  SpanExporterList,
} from './types.js'


export { genDecoratorExecutorOptions } from './trace.helper.js'
export {
  genTraceScope, getScopeStringCache,
} from './decorator.helper.base.js'

export { AttrNames } from './attrnames.types.js'

