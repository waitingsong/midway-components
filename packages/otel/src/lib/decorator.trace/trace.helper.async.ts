import assert from 'node:assert'

import { processDecoratorBeforeAfterAsync } from '../decorator.helper.async.js'
import { genTraceScopeFrom } from '../decorator.helper.js'
import type { DecoratorExecutorParam } from '../trace.helper.js'
import { ConfigKey } from '../types.js'


export async function beforeAsync(options: DecoratorExecutorParam): Promise<void> {
  const {
    callerAttr,
    spanName,
    startActiveSpan,
    traceContext,
    spanOptions,
    traceService,
  } = options

  assert(traceService, 'traceService is required')

  const type = 'before'
  const scope = genTraceScopeFrom(options)

  if (startActiveSpan) {
    options.span = traceService.startScopeActiveSpan({ name: spanName, spanOptions, traceContext, scope })
    options.span.setAttributes(callerAttr)
    return processDecoratorBeforeAfterAsync(type, options)
  }
  else {
    // it's necessary to cost a little time to prevent next span.startTime is same as previous span.endTime
    const rndStr = Math.random().toString(36).substring(7)
    void rndStr
    options.span = traceService.startSpan(spanName, spanOptions, traceContext, scope)
    options.span.setAttributes(callerAttr)
    return processDecoratorBeforeAfterAsync(type, options)
  }
}

export async function afterReturnAsync(options: DecoratorExecutorParam): Promise<unknown> {
  const { span, traceService } = options

  assert(! options.error, `[@mwcp/${ConfigKey.namespace}] options.error is not undefined in afterReturnAsync().
  Error: ${options.error?.message}`)

  /* c8 ignore next 3 */
  if (! span || ! traceService) {
    return options.methodResult
  }
  const type = 'after'
  await processDecoratorBeforeAfterAsync(type, options)

  const autoEndSpan = !! options.mergedDecoratorParam?.autoEndSpan
  autoEndSpan && traceService.endSpan(span)

  return options.methodResult
}

export async function afterThrowAsync(options: DecoratorExecutorParam): Promise<void> {
  const { span, traceService } = options
  if (! span || ! traceService) { return }

  assert(options.error, `[@mwcp/${ConfigKey.namespace}] options.error is undefined in afterThrowAsync().`)
  const type = 'afterThrow'
  await processDecoratorBeforeAfterAsync(type, options)
}

