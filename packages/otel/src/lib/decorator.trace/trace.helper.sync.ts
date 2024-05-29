import assert from 'node:assert'
import { isAsyncFunction } from 'util/types'

import { ConfigKey } from '@mwcp/share'
import { Span } from '@opentelemetry/api'

import { processDecoratorBeforeAfterSync } from '../decorator.helper.js'
import type { DecoratorExecutorParam } from '../trace.helper.js'
import { AttrNames } from '../types.js'


export function beforeSync(options: DecoratorExecutorParam): void {
  const {
    callerAttr,
    spanName,
    startActiveSpan,
    traceContext,
    spanOptions,
    traceService,
  } = options

  const type = 'before'

  const func = options.mergedDecoratorParam?.[type]
  assert(
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    ! func || ! isAsyncFunction(func),
    `[@mwcp/${ConfigKey.namespace}] Trace() ${type}() is a AsyncFunction, but decorated method is sync function, class: ${callerAttr[AttrNames.CallerClass]}, method: ${callerAttr[AttrNames.CallerMethod]}`,
  )

  if (! traceService) { return }

  if (startActiveSpan) {
    // 记录开始时间
    traceService.startActiveSpan(
      spanName,
      (span: Span) => {
        options.span = span
        options.span.setAttributes(callerAttr)
        processDecoratorBeforeAfterSync(type, options)
      },
      spanOptions,
      traceContext,
    )
  }
  else {
    options.span = traceService.startSpan(spanName, spanOptions, traceContext)
    options.span.setAttributes(callerAttr)
    processDecoratorBeforeAfterSync(type, options)
  }
}


export function afterReturnSync(options: DecoratorExecutorParam): unknown {
  const { span, traceService } = options

  assert(! options.error, `[@mwcp/${ConfigKey.namespace}] options.error is not undefined in afterReturnSync().
  Error: ${options.error?.message}`)

  if (! span || ! traceService) {
    return options.methodResult
  }
  processDecoratorBeforeAfterSync('after', options)

  const autoEndSpan = !! options.mergedDecoratorParam?.autoEndSpan
  autoEndSpan && traceService.endSpan(span)

  return options.methodResult
}

