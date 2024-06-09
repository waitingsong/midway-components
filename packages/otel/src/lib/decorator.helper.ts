import assert from 'node:assert'
import { isPromise } from 'node:util/types'

import type { Span } from '@opentelemetry/api'

import type { AbstractOtelComponent, AbstractTraceService } from './abstract.js'
import {
  TraceScopeType,
  TraceScopeParamType,
  type DecoratorContext,
  type DecoratorContextBase,
  type DecoratorTraceDataResp,
  type ScopeGenerator,
  type TraceDecoratorOptions,
} from './decorator.types.js'
import { DecoratorExecutorParam } from './trace.helper.js'
import { AttrNames } from './types.js'
import { isSpanEnded } from './util.js'


export async function processDecoratorBeforeAfterAsync(
  type: 'before' | 'after',
  options: DecoratorExecutorParam<TraceDecoratorOptions>,
): Promise<void> {

  const { mergedDecoratorParam, otelComponent, span, traceService } = options
  // not check traceService due to TraceInit decorator
  assert(span, 'span is required')

  const func = mergedDecoratorParam?.[type]
  if (typeof func === 'function') {
    assert(! isSpanEnded(span), 'span is ended after method call')
    const decoratorContext: DecoratorContext = {
      webApp: options.webApp,
      webContext: options.webContext,
      otelComponent: options.otelComponent,
      traceService: options.traceService,
      traceContext: options.traceContext,
      traceSpan: span,
      traceScope: options.traceScope,
      /** Caller Class name */
      instanceName: options.instanceName,
      /** Caller method name */
      methodName: options.methodName,
      // instance: options.instance,
    }

    let data
    if (type === 'before') {
      const func2 = func as NonNullable<TraceDecoratorOptions['before']>
      data = await func2(options.methodArgs, decoratorContext)
    }
    else {
      const func2 = func as NonNullable<TraceDecoratorOptions['after']>
      data = await func2(options.methodArgs, options.methodResult, decoratorContext)
    }

    if (data) {
      const eventName = type
      if (data.events && ! Object.keys(data.events).includes(eventName)) {
        data.events['event'] = eventName
      }
      processDecoratorSpanData(otelComponent, traceService, span, data)
    }
  }
  return
}

export function processDecoratorBeforeAfterSync(
  type: 'before' | 'after',
  options: DecoratorExecutorParam<TraceDecoratorOptions>,
): void {

  const { mergedDecoratorParam, otelComponent, span, traceService } = options
  // not check traceService due to TraceInit decorator
  assert(span, 'span is required')

  const func = mergedDecoratorParam?.[type]
  if (typeof func === 'function') {
    assert(! isSpanEnded(span), 'span is ended after method call')
    const decoratorContext: DecoratorContext = {
      webApp: options.webApp,
      webContext: options.webContext,
      otelComponent: options.otelComponent,
      traceService: options.traceService,
      traceContext: options.traceContext,
      traceSpan: span,
      traceScope: options.traceScope,
      /** Caller Class name */
      instanceName: options.instanceName,
      /** Caller method name */
      methodName: options.methodName,
    }

    let data
    if (type === 'before') {
      const func2 = func as NonNullable<TraceDecoratorOptions['before']>
      data = func2(options.methodArgs, decoratorContext)
    }
    else {
      const func2 = func as NonNullable<TraceDecoratorOptions['after']>
      data = func2(options.methodArgs, options.methodResult, decoratorContext)
    }

    if (data) {
      if (isPromise(data)) {
        const err = new Error(`processDecoratorBeforeAfterSync() decorator ${type}() return value is a promise,
      class: ${options.callerAttr[AttrNames.CallerClass]}, method: ${options.callerAttr[AttrNames.CallerMethod]}`)
        console.error(err)
        return
      }

      const eventName = type
      if (data.events && ! Object.keys(data.events).includes(eventName)) {
        data.events['event'] = eventName
      }
      processDecoratorSpanData(otelComponent, traceService, span, data)
    }
  }
  return
}

function processDecoratorSpanData(
  otelComponent: AbstractOtelComponent,
  traceService: AbstractTraceService | undefined,
  span: Span,
  info: DecoratorTraceDataResp | undefined,
): void {

  if (info && Object.keys(info).length > 0) {
    const { attrs, events, rootAttrs, rootEvents } = info
    if (events) {
      if (traceService) {
        traceService.addEvent(span, events)
      }
      else {
        otelComponent.addEvent(span, events)
      }
    }

    if (rootEvents) {
      if (traceService) {
        traceService.addEvent(traceService.rootSpan, rootEvents)
      }
    }

    if (rootAttrs && Object.keys(rootAttrs).length) {
      if (traceService) {
        traceService.setAttributes(traceService.rootSpan, rootAttrs)
      }
    }

    if (attrs && Object.keys(attrs).length) {
      if (traceService) {
        traceService.setAttributes(span, attrs)
      }
      else {
        otelComponent.setAttributes(span, attrs)
      }
    }
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

