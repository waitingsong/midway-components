import assert from 'node:assert'
import { isAsyncFunction } from 'util/types'

import { ConfigKey } from '@mwcp/share'

import type { DecoratorExecutorParam } from '../abstract.trace-service.js'
import { genTraceScopeFrom } from '../decorator.helper.base.js'
import { processDecoratorBeforeAfterSync } from '../decorator.helper.sync.js'
import { AttrNames } from '../types.js'


export function beforeSync(options: DecoratorExecutorParam): void {
  const { callerAttr, spanName, traceService } = options
  const type = 'before'

  const func = options.mergedDecoratorParam?.[type]
  assert(
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    ! func || ! isAsyncFunction(func),
    `[@mwcp/${ConfigKey.namespace}] Trace() ${type}() is a AsyncFunction, but decorated method is sync function, class: ${callerAttr[AttrNames.CallerClass]}, method: ${callerAttr[AttrNames.CallerMethod]}`,
  )
  assert(spanName, 'spanName is empty')

  const scope = genTraceScopeFrom(options) ?? options.webContext
  if (! options.span) {
    options.span = traceService.getActiveSpan(scope)
  }
  assert(options.webContext, 'beforeSync() webContext is required')
  processDecoratorBeforeAfterSync(options.webContext, type, options)
}


export function afterReturnSync(options: DecoratorExecutorParam): unknown {
  const { span } = options

  assert(! options.error, `[@mwcp/${ConfigKey.namespace}] options.error is not undefined in afterReturnSync().
  Error: ${options.error?.message}`)

  /* c8 ignore next 3 */
  if (! span) {
    return options.methodResult
  }
  assert(options.webContext, 'webContext is required')
  processDecoratorBeforeAfterSync(options.webContext, 'after', options)
  return options.methodResult
}


export function afterThrowSync(options: DecoratorExecutorParam): void {
  const { span } = options
  if (! span) { return }

  assert(options.error, `[@mwcp/${ConfigKey.namespace}] options.error is undefined in afterThrowAsync().`)
  const type = 'afterThrow'
  assert(options.webContext, 'webContext is required')
  processDecoratorBeforeAfterSync(options.webContext, type, options)
}

