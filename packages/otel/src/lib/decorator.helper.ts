import assert from 'node:assert'
import { isPromise } from 'node:util/types'

import type { Span } from '@opentelemetry/api'

import type { AbstractOtelComponent, AbstractTraceService } from './abstract.js'
import type {
  DecoratorContext,
  DecoratorContextBase,
  DecoratorTraceDataResp,
  ScopeGenerator,
  TraceDecoratorOptions,
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

export function genTraceScopeFrom(options: DecoratorExecutorParam): object | symbol | undefined {
  const { mergedDecoratorParam } = options

  let scope
  if (mergedDecoratorParam?.scope) {
    const decoratorContextBase: DecoratorContextBase = {
      webApp: options.webApp,
      webContext: options.webContext,
      otelComponent: options.otelComponent,
      traceService: options.traceService,
      // instance: options.instance,
    }
    scope = genTraceScope({
      scope: mergedDecoratorParam.scope,
      methodArgs: options.methodArgs,
      decoratorContext: decoratorContextBase,
    })
  }
  return scope
}

const traceScopeStringCache = new Map<string, symbol>()
function getScopeStringCache(key: string): symbol {
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
export function genTraceScope(options: GenTraceScopeOptions): object | symbol | undefined {
  const { scope } = options
  switch (typeof scope) {
    case 'string':
      // Symbol.for() invalid as key of WeakMap
      return getScopeStringCache(scope)

    case 'object':
      return scope

    case 'undefined':
      return

    case 'function': {
      const res = (scope as ScopeGenerator)(options.methodArgs, options.decoratorContext)
      assert(typeof res === 'object' || typeof res === 'symbol', 'scope function must return an object or a symbol')
      return res
    }

    case 'symbol':
      return scope

    /* c8 ignore next 2 */
    default:
      throw new Error('scope must be a string, an object, a symbol, or a function')
  }

}

