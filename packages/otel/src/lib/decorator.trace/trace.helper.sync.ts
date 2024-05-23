import assert from 'assert'
import { isPromise } from 'node:util/types'

import { Span, SpanStatusCode } from '@opentelemetry/api'

import { processDecoratorBeforeAfterSync } from '../decorator.helper.js'
import type { DecoratorExecutorParam } from '../trace.helper.js'


export function decoratorExecutorSync(options: DecoratorExecutorParam): unknown {
  const {
    config,
    method,
    methodArgs,
    callerAttr,
    spanName,
    startActiveSpan,
    traceContext,
    spanOptions,
    traceService,
  } = options

  /* c8 ignore next 3 */
  if (! config.enable || ! traceService?.isStarted) {
    return method(...methodArgs)
  }

  if (startActiveSpan) {
    // 记录开始时间
    return traceService.startActiveSpan(
      spanName,
      (span: Span) => {
        span.setAttributes(callerAttr)
        return RunAndEndSpanCb(options, span)
      },
      spanOptions,
      traceContext,
    )
  }
  else {
    const span = traceService.startSpan(spanName, spanOptions, traceContext)
    span.setAttributes(callerAttr)
    return RunAndEndSpanCb(options, span)
  }
}


function RunAndEndSpanCb(options: DecoratorExecutorParam, span: Span): unknown {
  const { mergedDecoratorParam, method, methodArgs, traceService } = options
  const autoEndSpan = !! mergedDecoratorParam?.autoEndSpan

  try {
    processDecoratorBeforeAfterSync('before', options, span, void 0)

    const resp = method(...methodArgs)
    assert(! isPromise(resp), 'func return value is a promise')
    processDecoratorBeforeAfterSync('after', options, span, resp)

    autoEndSpan && traceService && traceService.endSpan(span)
    return resp
  }
  catch (ex) {
    const err = ex instanceof Error
      ? ex
      : new Error(typeof ex === 'string' ? ex : JSON.stringify(ex))
    traceService && traceService.endSpan(span, { code: SpanStatusCode.ERROR, error: err })
    throw new Error(err.message, { cause: err.cause ?? err })
  }
}


