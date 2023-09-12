import assert from 'assert'
import { isPromise } from 'node:util/types'

import { Span, SpanStatusCode } from '@opentelemetry/api'

import type { AbstractTraceService } from '../abstract.js'
import type { DecoratorExecutorParam } from '../trace.helper.js'


export async function decoratorExecutorAsync(
  options: DecoratorExecutorParam,
): Promise<unknown> {

  const {
    config,
    method: func,
    methodArgs: funcArgs,
    callerAttr,
    spanName,
    startActiveSpan,
    traceContext,
    spanOptions,
    traceService,
    mergedDecoratorParam,
  } = options

  if (! config.enable) {
    const ret = await func(...funcArgs)
    return ret
  }

  if (! traceService) {
    console.warn('traceService is not initialized. (traceService 尚未初始化。)')
    const ret = await func(...funcArgs)
    return ret
  }

  if (startActiveSpan) {
    // 记录开始时间
    return traceService.startActiveSpan(
      spanName,
      async (span: Span) => {
        span.setAttributes(callerAttr)
        const opts = {
          func,
          funcArgs,
          span,
          traceService,
          autoEndSpan: mergedDecoratorParam?.autoEndSpan ?? true,
        }
        const ret = await createActiveSpanCb(opts)
        return ret
      },
      spanOptions,
      traceContext,
    )
  }
  else {
    const span = traceService.startSpan(spanName, spanOptions, traceContext)
    span.setAttributes(callerAttr)
    const opts = {
      func,
      funcArgs,
      span,
      traceService,
      autoEndSpan: mergedDecoratorParam?.autoEndSpan ?? true,
    }
    const ret = await createActiveSpanCb(opts)
    return ret
  }
}

export function decoratorExecutorSync(
  options: DecoratorExecutorParam,
): unknown {

  const {
    config,
    method: func,
    methodArgs: funcArgs,
    callerAttr,
    spanName,
    startActiveSpan,
    traceContext,
    spanOptions,
    traceService,
    mergedDecoratorParam,
  } = options

  if (! config.enable) {
    const ret = func(...funcArgs)
    return ret
  }

  if (! traceService) {
    console.warn('traceService is not initialized. (traceService 尚未初始化。)')
    const ret = func(...funcArgs)
    return ret
  }


  if (startActiveSpan) {
    // 记录开始时间
    return traceService.startActiveSpan(
      spanName,
      (span: Span) => {
        span.setAttributes(callerAttr)
        const opts = {
          func,
          funcArgs,
          span,
          traceService,
          autoEndSpan: mergedDecoratorParam?.autoEndSpan ?? true,
        }
        return createActiveSpanCbSync(opts)
      },
      spanOptions,
      traceContext,
    )
  }
  else {
    const span = traceService.startSpan(spanName, spanOptions, traceContext)
    span.setAttributes(callerAttr)
    const opts = {
      func,
      funcArgs,
      span,
      traceService,
      autoEndSpan: mergedDecoratorParam?.autoEndSpan ?? true,
    }
    return createActiveSpanCbSync(opts)
  }
}



interface CreateActiveSpanCbOptions {
  func: (...args: unknown[]) => unknown
  funcArgs: unknown[]
  span: Span
  traceService: AbstractTraceService
  autoEndSpan: boolean
}
async function createActiveSpanCb(options: CreateActiveSpanCbOptions): Promise<unknown> {
  const { func, funcArgs, span, traceService, autoEndSpan } = options

  try {
    const resp = func(...funcArgs)
    assert(isPromise(resp), 'func return value is not a promise')
    const ret = await resp
    autoEndSpan && traceService.endSpan(span)
    return ret
  }
  catch (ex) {
    const err = ex instanceof Error
      ? ex
      : new Error(typeof ex === 'string' ? ex : JSON.stringify(ex))
    traceService.endSpan(span, { code: SpanStatusCode.ERROR, error: err })
    throw new Error(err.message, { cause: err.cause ?? err })
  }
}

function createActiveSpanCbSync(options: CreateActiveSpanCbOptions): unknown {
  const { func, funcArgs, span, traceService, autoEndSpan } = options

  try {
    const resp = func(...funcArgs)
    assert(! isPromise(resp), 'func return value is a promise')
    autoEndSpan && traceService.endSpan(span)
    return resp
  }
  catch (ex) {
    const err = ex instanceof Error
      ? ex
      : new Error(typeof ex === 'string' ? ex : JSON.stringify(ex))
    traceService.endSpan(span, { code: SpanStatusCode.ERROR, error: err })
    throw new Error(err.message, { cause: err.cause ?? err })
  }
}
