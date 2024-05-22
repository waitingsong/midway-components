import assert from 'assert'
import { isPromise } from 'node:util/types'

import { Span, SpanStatusCode } from '@opentelemetry/api'

import type { AbstractTraceService } from '../abstract.js'
import type { DecoratorExecutorParam } from '../trace.helper.js'


export function decoratorExecutorSync(options: DecoratorExecutorParam): unknown {
  const {
    config,
    method,
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
    const ret = method(...funcArgs)
    return ret
  }

  if (! traceService?.isStarted) {
    // console.warn('decoratorExecutorSync() traceService is not initialized. (traceService 尚未初始化) 路由可能设置为忽略追踪')
    const ret = method(...funcArgs)
    return ret
  }

  if (startActiveSpan) {
    // 记录开始时间
    return traceService.startActiveSpan(
      spanName,
      (span: Span) => {
        span.setAttributes(callerAttr)
        const opts = {
          func: method,
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
      func: method,
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
