import assert from 'node:assert'

import type { DecoratorExecutorParam } from '../abstract.trace-service.js'
import { processDecoratorBeforeAfterAsync } from '../decorator.helper.async.js'
import { genTraceScopeFrom } from '../decorator.helper.base.js'
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

  const type = 'before'
  const scope = genTraceScopeFrom(options) ?? options.webContext
  assert(scope, 'beforeAsync() scope is required')
  assert(options.webContext, 'beforeAsync() webContext is required')

  if (startActiveSpan) {
    options.span = traceService.startScopeActiveSpan({ name: spanName, spanOptions, traceContext, scope }).span
    options.span.setAttributes(callerAttr)
    return processDecoratorBeforeAfterAsync(options.webContext, type, options)
  }
  else {
    // it's necessary to cost a little time to prevent next span.startTime is same as previous span.endTime
    const rndStr = Math.random().toString(36).substring(7)
    void rndStr
    options.span = traceService.startSpan(spanName, spanOptions, traceContext, scope)
    options.span.setAttributes(callerAttr)
    return processDecoratorBeforeAfterAsync(options.webContext, type, options)
  }
}

export async function afterReturnAsync(options: DecoratorExecutorParam): Promise<unknown> {
  const { span, traceService } = options

  assert(! options.error, `[@mwcp/${ConfigKey.namespace}] options.error is not undefined in afterReturnAsync().
  Error: ${options.error?.message}`)

  /* c8 ignore next 3 */
  if (! span) {
    return options.methodResult
  }
  const type = 'after'
  assert(options.webContext, 'webContext is required')
  await processDecoratorBeforeAfterAsync(options.webContext, type, options)

  const autoEndSpan = !! options.mergedDecoratorParam?.autoEndSpan
  autoEndSpan && traceService.endSpan({ span, scope: options.traceScope })

  return options.methodResult
}

export async function afterThrowAsync(options: DecoratorExecutorParam): Promise<void> {
  const { span } = options
  if (! span) { return }

  assert(options.error, `[@mwcp/${ConfigKey.namespace}] options.error is undefined in afterThrowAsync().`)
  const type = 'afterThrow'
  assert(options.webContext, 'webContext is required')
  await processDecoratorBeforeAfterAsync(options.webContext, type, options)
}

