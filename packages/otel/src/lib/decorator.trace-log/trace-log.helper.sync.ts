import assert from 'node:assert'
import { isAsyncFunction } from 'util/types'

import { ConfigKey } from '@mwcp/share'

import { genTraceScopeFrom } from '../decorator.helper.base.js'
import { processDecoratorBeforeAfterSync } from '../decorator.helper.sync.js'
import type { DecoratorExecutorParam, DecoratorTraceDataResp } from '../trace.service.js'
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

  options.traceScope = genTraceScopeFrom(options)
  if (! options.traceScope) {
    options.traceScope = options.webContext ?? options.webApp
  }

  if (! options.span) {
    options.span = traceService.getActiveSpan(options.traceScope)
  }
  const res: DecoratorTraceDataResp = processDecoratorBeforeAfterSync(type, options)
  if (res?.endSpanAfterTraceLog) {
    assert(options.span, 'span is required')
    if (res.spanStatusOptions) {
      traceService.endSpan({ span: options.span, spanStatusOptions: res.spanStatusOptions })
    }
    else {
      traceService.endSpan({ span: options.span })
    }
  }
}


export async function afterReturnSync(options: DecoratorExecutorParam): Promise<unknown> {
  const { span, traceService } = options
  /* c8 ignore next 3 */
  if (! span) {
    return options.methodResult
  }

  assert(! options.error, `[@mwcp/${ConfigKey.namespace}] options.error is not undefined in afterReturnSync().
  Error: ${options.error?.message}`)

  const res: DecoratorTraceDataResp = processDecoratorBeforeAfterSync('after', options)
  if (res?.endSpanAfterTraceLog) {
    if (res.spanStatusOptions) {
      traceService.endSpan({ span, spanStatusOptions: res.spanStatusOptions })
    }
    else {
      traceService.endSpan({ span })
    }
  }

  return options.methodResult
}


export function afterThrowSync(options: DecoratorExecutorParam): void {
  const { span } = options
  if (! span) { return }

  assert(options.error, `[@mwcp/${ConfigKey.namespace}] options.error is undefined in afterThrowAsync().`)
  const type = 'afterThrow'
  processDecoratorBeforeAfterSync(type, options)
}

