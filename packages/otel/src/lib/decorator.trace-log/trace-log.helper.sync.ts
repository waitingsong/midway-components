import assert from 'node:assert'
import { isAsyncFunction } from 'node:util/types'

import { ConfigKey } from '@mwcp/share'
import { context } from '@opentelemetry/api'

import { processDecoratorBeforeAfterSync } from '../decorator.helper.sync.js'
import { endTraceSpan } from '../trace.helper.js'
import type { DecoratorExecutorParam, DecoratorTraceDataResp } from '../trace.service/index.trace.service.js'
import { AttrNames } from '../types.js'


export function beforeSync(options: DecoratorExecutorParam): void {
  const { callerAttr, spanName, traceService } = options
  const type = 'before'

  const func = options.mergedDecoratorParam?.[type]
  assert(
    ! func || ! isAsyncFunction(func),
    `[@mwcp/${ConfigKey.namespace}] Trace() ${type}() is a AsyncFunction, but decorated method is sync function, class: ${callerAttr[AttrNames.CallerClass]}, method: ${callerAttr[AttrNames.CallerMethod]}`,
  )
  assert(spanName, 'spanName is empty')

  if (! options.traceContext || ! options.span) {
    const info = traceService.getActiveTraceInfo()
    options.span = info.span
    options.traceContext = info.traceContext
  }

  context.with(options.traceContext, () => {
    const res: DecoratorTraceDataResp = processDecoratorBeforeAfterSync(type, options)
    if (res?.endSpanAfterTraceLog) {
      assert(options.span, 'span is required')
      if (Array.isArray(res.endSpanAfterTraceLog)) {
        endTraceSpan(traceService, res.endSpanAfterTraceLog, res.spanStatusOptions)
      }
      else {
        endTraceSpan(traceService, [options.span], res.spanStatusOptions)
      }
    }
  })

}


export function afterReturnSync(options: DecoratorExecutorParam): unknown {
  const { span, traceService } = options
  /* c8 ignore next 3 */
  if (! span) {
    return options.methodResult
  }

  assert(! options.error, `[@mwcp/${ConfigKey.namespace}] options.error is not undefined in afterReturnSync().
  Error: ${options.error?.message}`)

  if (! options.traceContext || ! options.span) {
    const info = traceService.getActiveTraceInfo()
    options.span = info.span
    options.traceContext = info.traceContext
  }
  context.with(options.traceContext, () => {
    const res: DecoratorTraceDataResp = processDecoratorBeforeAfterSync('after', options)
    if (res?.endSpanAfterTraceLog) {
      if (Array.isArray(res.endSpanAfterTraceLog)) {
        endTraceSpan(traceService, res.endSpanAfterTraceLog, res.spanStatusOptions)
      }
      else {
        endTraceSpan(traceService, [span], res.spanStatusOptions)
      }
    }
  })

  return options.methodResult
}


export function afterThrowSync(options: DecoratorExecutorParam): void {
  const { span } = options
  if (! span) { return }

  assert(options.error, `[@mwcp/${ConfigKey.namespace}] options.error is undefined in afterThrowAsync().`)
  const type = 'afterThrow'
  const traceContext = options.traceContext ?? options.traceService.getActiveContext()
  context.with(traceContext, () => {
    processDecoratorBeforeAfterSync(type, options)
  })
}

