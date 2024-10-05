import assert from 'node:assert'
import { isAsyncFunction } from 'node:util/types'

import { ConfigKey } from '@mwcp/share'

import { genTraceScopeFrom } from '../decorator.helper.base.js'
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

  options.traceScope = genTraceScopeFrom(options)
  if (! options.traceScope) {
    options.traceScope = options.webContext ?? options.webApp
  }

  if (! options.span) {
    const info = traceService.getActiveTraceInfo(options.traceScope)
    if (info) {
      options.span = info.span
      options.traceContext = info.traceContext
    }
  }

  const res: DecoratorTraceDataResp = processDecoratorBeforeAfterSync(type, options)
  if (res?.endSpanAfterTraceLog) {
    assert(options.span, 'span is required')
    endTraceSpan(traceService, options.span, res.spanStatusOptions)
  }

  if (res?.endParentSpan) {
    assert(options.span, 'span is required')

    if (! res.endSpanAfterTraceLog) {
      endTraceSpan(traceService, options.span, res.spanStatusOptions)
    }

    const parentSpan = traceService.retrieveParentTraceInfoBySpan(options.span, options.traceScope)?.span
    if (parentSpan) {
      endTraceSpan(traceService, parentSpan, res.spanStatusOptions)
    }
  }
}


export function afterReturnSync(options: DecoratorExecutorParam): unknown {
  const { span, traceService } = options
  /* c8 ignore next 3 */
  if (! span) {
    return options.methodResult
  }

  assert(! options.error, `[@mwcp/${ConfigKey.namespace}] options.error is not undefined in afterReturnSync().
  Error: ${options.error?.message}`)

  const res: DecoratorTraceDataResp = processDecoratorBeforeAfterSync('after', options)
  if (res?.endSpanAfterTraceLog) {
    endTraceSpan(traceService, span, res.spanStatusOptions)
  }

  if (res?.endParentSpan) {
    if (! res.endSpanAfterTraceLog) {
      endTraceSpan(traceService, span, res.spanStatusOptions)
    }

    const parentSpan = traceService.retrieveParentTraceInfoBySpan(span, options.traceScope)?.span
    if (parentSpan) {
      endTraceSpan(traceService, parentSpan, res.spanStatusOptions)
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

