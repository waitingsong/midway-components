import { Span } from '@opentelemetry/api'

import { processDecoratorBeforeAfterAsync } from '../decorator.helper.js'
import type { DecoratorExecutorParam } from '../trace.helper.js'


export async function beforeAsync(options: DecoratorExecutorParam): Promise<void> {
  const {
    callerAttr,
    spanName,
    startActiveSpan,
    traceContext,
    spanOptions,
    traceService,
  } = options

  const type = 'before'

  if (! traceService) { return }

  if (startActiveSpan) {
    // 记录开始时间
    await traceService.startActiveSpan(
      spanName,
      async (span: Span) => {
        options.span = span
        options.span.setAttributes(callerAttr)
        await processDecoratorBeforeAfterAsync(type, options)
      },
      spanOptions,
      traceContext,
    )
  }
  else {
    options.span = traceService.startSpan(spanName, spanOptions, traceContext)
    options.span.setAttributes(callerAttr)
    return processDecoratorBeforeAfterAsync(type, options)
  }
}

export async function afterReturnAsync(options: DecoratorExecutorParam): Promise<unknown> {
  const { span, traceService } = options

  if (! span || ! traceService) {
    return options.methodResult
  }
  await processDecoratorBeforeAfterAsync('after', options)

  const autoEndSpan = !! options.mergedDecoratorParam?.autoEndSpan
  autoEndSpan && traceService.endSpan(span)

  return options.methodResult
}

