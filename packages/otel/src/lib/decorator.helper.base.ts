import assert from 'node:assert'

import type { Span } from '@opentelemetry/api'
import { isArrowFunction } from '@waiting/shared-core'

import type {
  TraceService,
  DecoratorExecutorParam,
  DecoratorContextBase,
  DecoratorTraceDataResp,
  ScopeGenerator,
  TraceDecoratorOptions,
} from './trace.service.js'
import type { Attributes, TraceScopeParamType, TraceScopeType } from './types.js'


export function processDecoratorSpanData(
  scope: TraceScopeType,
  traceService: TraceService,
  span: Span,
  info: DecoratorTraceDataResp | undefined,
): void {

  if (info && Object.keys(info).length > 0) {
    const { attrs, events, rootAttrs, rootEvents } = info
    if (! attrs && ! events && ! rootAttrs && ! rootEvents) { return }

    const rootSpan = traceService.getRootSpan(scope)
    processEvents(traceService, span, events)
    processEvents(traceService, rootSpan, rootEvents)

    processAttrs(traceService, span, attrs)
    processAttrs(traceService, rootSpan, rootAttrs)
  }
}

function processAttrs(
  traceService: TraceService,
  span: Span | undefined,
  attrs: Attributes | undefined,
): void {

  if (! attrs || ! span || ! Object.keys(attrs).length) { return }
  traceService.setAttributes(span, attrs)
}

function processEvents(
  traceService: TraceService,
  span: Span | undefined,
  events: Attributes | undefined,
): void {

  if (! events || ! span || ! Object.keys(events).length) { return }
  traceService.addEvent(span, events)
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
    instance: options.instance,
  })
  if (! ret) {
    const scope: TraceScopeParamType | undefined = options.mergedDecoratorParam?.scope
    ret = genTraceScope({
      scope,
      methodArgs: options.methodArgs,
      decoratorContext: decoratorContextBase,
      instance: options.instance,
    })
  }
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
  instance: DecoratorExecutorParam['instance']
}
export function genTraceScope(options: GenTraceScopeOptions): TraceScopeType | undefined {
  const { scope } = options

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
      assert(options.instance, 'instance is required')
      const funcBind = (isArrowFunction(scope as ScopeGenerator) ? scope : scope.bind(options.instance)) as ScopeGenerator
      ret = funcBind(options.methodArgs, options.decoratorContext)
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const val = arg[key]
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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

