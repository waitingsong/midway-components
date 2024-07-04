import assert from 'node:assert'
import { isAsyncFunction } from 'util/types'

import { ConfigKey } from '@mwcp/share'

import { genTraceScopeFrom } from '../decorator.helper.js'
import { processDecoratorBeforeAfterSync } from '../decorator.helper.sync.js'
import type { DecoratorExecutorParam } from '../trace.helper.js'
import { AttrNames } from '../types.js'


export function beforeSync(options: DecoratorExecutorParam): void {
  const { callerAttr, spanName, traceService } = options
  assert(traceService, 'traceService is required')

  const type = 'before'

  const func = options.mergedDecoratorParam?.[type]
  assert(
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    ! func || ! isAsyncFunction(func),
    `[@mwcp/${ConfigKey.namespace}] Trace() ${type}() is a AsyncFunction, but decorated method is sync function, class: ${callerAttr[AttrNames.CallerClass]}, method: ${callerAttr[AttrNames.CallerMethod]}`,
  )
  assert(spanName, 'spanName is empty')

  if (! options.span) {
    const scope = genTraceScopeFrom(options)
    options.span = traceService.getActiveSpan(scope)
  }
  processDecoratorBeforeAfterSync(type, options)
}


export function afterReturnSync(options: DecoratorExecutorParam): unknown {
  const { span, traceService } = options

  assert(! options.error, `[@mwcp/${ConfigKey.namespace}] options.error is not undefined in afterReturnSync().
  Error: ${options.error?.message}`)

  /* c8 ignore next 3 */
  if (! span || ! traceService) {
    return options.methodResult
  }
  processDecoratorBeforeAfterSync('after', options)
  return options.methodResult
}


export function afterThrowSync(options: DecoratorExecutorParam): void {
  const { span, traceService } = options
  if (! span || ! traceService) { return }

  assert(options.error, `[@mwcp/${ConfigKey.namespace}] options.error is undefined in afterThrowAsync().`)
  const type = 'afterThrow'
  processDecoratorBeforeAfterSync(type, options)
}
