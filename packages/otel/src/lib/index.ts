
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
  genRequestSpanName,
  getIncomingRequestAttributesFromWebContext,
  getSpan,
  normalizeHeaderKey,
  parseResponseStatus,
  propagateHeader,
  propagateOutgoingHeader,
  setResponseContentLengthAttribute,
  setSpan,
  setSpanWithRequestHeaders,
} from './util.js'

export {
  type AddEventOptions,

  type Attributes,
  type AttributesMap,
  type Config as OtelConfig,
  type InitTraceOptions,
  type JaegerTraceInfo,
  type JaegerTraceInfoLog,
  type JaegerTraceInfoLogField,
  type JaegerTraceInfoReferences,
  type JaegerTraceInfoSpan,
  type MiddlewareConfig as OtelMiddlewareConfig,
  type MiddlewareOptions as OtelMiddlewareOptions,
  type SpanHeaderInit,
  type SpanStatusOptions,
  type TraceError,
  type TraceLogType as LogInfo,
  type TraceScopeParamType,
  type TraceScopeType,
  ConfigKey as OtelConfigKey,
  HeadersKey,
  Msg as TracerMsg,
  SpanExporterList,
} from './types.js'


export { genDecoratorExecutorOptions } from './trace.helper.js'
export {
  genTraceScope, getScopeStringCache,
} from './decorator.helper.base.js'

export { AttrNames } from './attrnames.types.js'

