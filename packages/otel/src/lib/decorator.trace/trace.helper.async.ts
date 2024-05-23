import assert from 'assert'
import { isPromise } from 'node:util/types'

import { Span, SpanStatusCode } from '@opentelemetry/api'

import { processDecoratorBeforeAfterAsync } from '../decorator.helper.js'
import type { DecoratorExecutorParam } from '../trace.helper.js'


export async function decoratorExecutorAsync(options: DecoratorExecutorParam): Promise<unknown> {
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
      async (span: Span) => {
        span.setAttributes(callerAttr)
        const ret = await runAndEndSpanCb(options, span)
        return ret
      },
      spanOptions,
      traceContext,
    )
  }
  else {
    const span = traceService.startSpan(spanName, spanOptions, traceContext)
    span.setAttributes(callerAttr)
    const ret = await runAndEndSpanCb(options, span)
    return ret
  }
}


async function runAndEndSpanCb(options: DecoratorExecutorParam, span: Span): Promise<unknown> {
  const { mergedDecoratorParam, method, methodArgs, traceService } = options
  const autoEndSpan = !! mergedDecoratorParam?.autoEndSpan

  try {
    await processDecoratorBeforeAfterAsync('before', options, span, void 0)

    const resp = method(...methodArgs)
    assert(isPromise(resp), 'func return value is not a promise')
    const ret = await resp
    await processDecoratorBeforeAfterAsync('after', options, span, ret)

    autoEndSpan && traceService && traceService.endSpan(span)
    return ret
  }
  catch (ex) {
    const err = ex instanceof Error
      ? ex
      : new Error(typeof ex === 'string' ? ex : JSON.stringify(ex))

    traceService && traceService.endSpan(span, { code: SpanStatusCode.ERROR, error: err })
    throw new Error(err.message, { cause: err.cause ?? err })
  }
}
