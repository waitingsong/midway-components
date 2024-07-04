import assert from 'node:assert'

import type { Span } from '@opentelemetry/api'

import type { AbstractOtelComponent, AbstractTraceService } from './abstract.js'
import type {
  DecoratorContextBase,
  DecoratorTraceDataResp,
  ScopeGenerator,
  TraceDecoratorOptions,
  TraceScopeType,
  TraceScopeParamType,
} from './decorator.types.js'
import type { DecoratorExecutorParam } from './trace.helper.js'
import type { Attributes } from './types.js'


export function processDecoratorSpanData(
  otelComponent: AbstractOtelComponent,
  traceService: AbstractTraceService | undefined,
  span: Span,
  info: DecoratorTraceDataResp | undefined,
): void {

  if (info && Object.keys(info).length > 0) {
    const { attrs, events, rootAttrs, rootEvents } = info
    processEvents(otelComponent, traceService, span, events)
    processEvents(otelComponent, traceService, traceService?.rootSpan, rootEvents)

    processAttrs(otelComponent, traceService, span, attrs)
    processAttrs(otelComponent, traceService, traceService?.rootSpan, rootAttrs)
  }
}

function processAttrs(
  otelComponent: AbstractOtelComponent,
  traceService: AbstractTraceService | undefined,
  span: Span | undefined,
  attrs: Attributes | undefined,
): void {

  if (! attrs || ! span || ! Object.keys(attrs).length) { return }

  if (traceService) {
    traceService.setAttributes(span, attrs)
  }
  else {
    otelComponent.setAttributes(span, attrs)
  }
}

function processEvents(
  otelComponent: AbstractOtelComponent,
  traceService: AbstractTraceService | undefined,
  span: Span | undefined,
  events: Attributes | undefined,
): void {

  if (! events || ! span || ! Object.keys(events).length) { return }

  if (traceService) {
    traceService.addEvent(span, events)
  }
  else {
    otelComponent.addEvent(span, events)
  }
}

/**
 * @note
 * - input options.traceScope will be updated by generated traceScope
 * - the first object arg of methodArgs will be appended key `traceScope` and set value
 */
export function genTraceScopeFrom(options: DecoratorExecutorParam): TraceScopeType | undefined {
  if (options.traceScope && isTraceScopeParamType(options.traceScope)) {
    return options.traceScope
  }

  const decoratorContextBase: DecoratorContextBase = {
    webApp: options.webApp,
    webContext: options.webContext,
    otelComponent: options.otelComponent,
    traceService: options.traceService,
    traceScope: options.traceScope,
    /** Caller Class name */
    instanceName: options.instanceName,
    /** Caller method name */
    methodName: options.methodName,
    // instance: options.instance,
  }

  const scopeFromArg = getTraceScopeParamFromArgs(options.methodArgs as GetTraceScopeFromArgsOptions[])
  let ret = genTraceScope({
    scope: scopeFromArg,
    methodArgs: options.methodArgs,
    decoratorContext: decoratorContextBase,
  })
  if (! ret) {
    const scope: TraceScopeParamType | undefined = options.mergedDecoratorParam?.scope
    ret = genTraceScope({
      scope,
      methodArgs: options.methodArgs,
      decoratorContext: decoratorContextBase,
    })
  }
  options.traceScope = ret
  return ret
}

const traceScopeStringCache = new Map<string, symbol>()
export function getScopeStringCache(key: string): symbol {
  let sym = traceScopeStringCache.get(key)
  if (! sym) {
    sym = Symbol(key)
    setScopeStringCache(key, sym)
  }
  return sym
}
function setScopeStringCache(key: string, sym: symbol): void {
  /* c8 ignore next 3 */
  if (traceScopeStringCache.size > 10000) {
    console.warn('traceScopeStringCache.size > 10000, should clear it')
  }
  traceScopeStringCache.set(key, sym)
}

export interface GenTraceScopeOptions {
  scope: TraceDecoratorOptions['scope']
  methodArgs: unknown[]
  decoratorContext: DecoratorContextBase
}
export function genTraceScope(options: GenTraceScopeOptions): TraceScopeType | undefined {
  const tmp = options.scope

  const scope = tmp

  let ret: TraceScopeType | undefined
  switch (typeof scope) {
    case 'string': {
      // Symbol.for() invalid as key of WeakMap
      ret = getScopeStringCache(scope)
      break
    }

    case 'object': {
      ret = scope
      break
    }

    case 'undefined':
      return

    case 'function': {
      ret = (scope as ScopeGenerator)(options.methodArgs, options.decoratorContext)
      assert(typeof ret === 'object' || typeof ret === 'symbol', 'scope function must return an object or a symbol')
      break
    }

    case 'symbol': {
      ret = scope
      break
    }

    /* c8 ignore next 2 */
    default:
      throw new Error('scope must be a string, an object, a symbol, or a function')
  }

  return ret
}

// function updateTraceScopeProperty(input: TraceScopeType): void {
//   assert(typeof input === 'object', 'input must be an object')
//   if (input.isTraceScope) { return }
//   Object.defineProperty(input, 'isTraceScope', { value: true })
// }

type GetTraceScopeFromArgsOptions = TraceScopeParamType | { traceScope?: TraceScopeParamType, [key: string]: unknown }

export function getTraceScopeParamFromArgs(
  args: GetTraceScopeFromArgsOptions[] | undefined,
): TraceScopeParamType | undefined {

  const key = 'traceScope'

  if (! args || ! Array.isArray(args)) { return }
  for (const arg of args) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (! arg || typeof arg !== 'object') { continue }

    // @ts-ignore
    const val = arg[key] as TraceScopeParamType | undefined
    if (val && isTraceScopeParamType(val)) {
      return val
    }
  }
}

export function isTraceScopeParamType(input: TraceScopeParamType | undefined): input is TraceScopeParamType {
  if (! input) {
    return false
  }

  switch (typeof input) {
    case 'string':
      return true

    case 'symbol':
      return true

    case 'object':
      return true

    default:
      return false
  }
}

