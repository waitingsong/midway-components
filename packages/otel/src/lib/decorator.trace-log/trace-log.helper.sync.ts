import assert from 'node:assert'
import { isAsyncFunction } from 'util/types'

import { ConfigKey } from '@mwcp/share'

import { genTraceScopeFrom, processDecoratorBeforeAfterSync } from '../decorator.helper.js'
import type { DecoratorExecutorParam } from '../trace.helper.js'
import { AttrNames } from '../types.js'


export function beforeSync(options: DecoratorExecutorParam): void {
  const { callerAttr, spanName, traceService } = options
  if (! traceService) { return }

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

  if (! span || ! traceService) {
    return options.methodResult
  }
  processDecoratorBeforeAfterSync('after', options)
  return options.methodResult
}

