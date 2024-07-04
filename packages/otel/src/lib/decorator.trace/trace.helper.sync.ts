import assert from 'node:assert'
import { isAsyncFunction } from 'util/types'

import { ConfigKey } from '@mwcp/share'

import { genTraceScopeFrom } from '../decorator.helper.js'
import { processDecoratorBeforeAfterSync } from '../decorator.helper.sync.js'
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

  assert(traceService, 'traceService is required')

  const type = 'before'

  const func = options.mergedDecoratorParam?.[type]
  assert(
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    ! func || ! isAsyncFunction(func),
    `[@mwcp/${ConfigKey.namespace}] Trace() ${type}() is a AsyncFunction, but decorated method is sync function, class: ${callerAttr[AttrNames.CallerClass]}, method: ${callerAttr[AttrNames.CallerMethod]}`,
  )
  assert(spanName, 'spanName is empty')
  const scope = genTraceScopeFrom(options)

  if (startActiveSpan) {
    options.span = traceService.startScopeActiveSpan({ name: spanName, spanOptions, traceContext, scope })
    options.span.setAttributes(callerAttr)
    processDecoratorBeforeAfterSync(type, options)
  }
  else {
    // it's necessary to cost a little time to prevent next span.startTime is same as previous span.endTime
    const rndStr = Math.random().toString(36).substring(7)
    void rndStr
    options.span = traceService.startSpan(spanName, spanOptions, traceContext, scope)
    options.span.setAttributes(callerAttr)
    processDecoratorBeforeAfterSync(type, options)
  }
}

export function afterReturnSync(options: DecoratorExecutorParam): unknown {
  const { span, traceService } = options

  assert(! options.error, `[@mwcp/${ConfigKey.namespace}] options.error is not undefined in afterReturnSync().
  Error: ${options.error?.message}`)

  /* c8 ignore next 3 */
  if (! span || ! traceService) {
    return options.methodResult
  }
  const type = 'after'
  processDecoratorBeforeAfterSync(type, options)

  const autoEndSpan = !! options.mergedDecoratorParam?.autoEndSpan
  autoEndSpan && traceService.endSpan(span)

  return options.methodResult
}

export function afterThrowSync(options: DecoratorExecutorParam): void {
  const { span, traceService } = options
  if (! span || ! traceService) { return }

  assert(options.error, `[@mwcp/${ConfigKey.namespace}] options.error is undefined in afterThrowAsync().`)
  const type = 'afterThrow'
  processDecoratorBeforeAfterSync(type, options)
}

