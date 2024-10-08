import assert from 'node:assert'

import { processDecoratorBeforeAfterAsync } from '../decorator.helper.async.js'
import { genTraceScopeFrom } from '../decorator.helper.base.js'
import { endTraceSpan } from '../trace.helper.js'
import type { DecoratorExecutorParam, DecoratorTraceDataResp } from '../trace.service/index.trace.service.js'
import { ConfigKey } from '../types.js'


export async function beforeAsync(options: DecoratorExecutorParam): Promise<void> {
  const { traceService } = options

  const type = 'before'
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

  const res: DecoratorTraceDataResp = await processDecoratorBeforeAfterAsync(type, options)
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

export async function afterReturnAsync(options: DecoratorExecutorParam): Promise<unknown> {
  const { span, traceService } = options
  /* c8 ignore next 3 */
  if (! span) {
    return options.methodResult
  }

  assert(! options.error, `[@mwcp/${ConfigKey.namespace}] options.error is not undefined in afterReturnAsync().
  Error: ${options.error?.message}`)

  const res: DecoratorTraceDataResp = await processDecoratorBeforeAfterAsync('after', options)
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

export async function afterThrowAsync(options: DecoratorExecutorParam): Promise<void> {
  const { span } = options
  if (! span) { return }

  assert(options.error, `[@mwcp/${ConfigKey.namespace}] options.error is undefined in afterThrowAsync().`)
  await processDecoratorBeforeAfterAsync('afterThrow', options)
}

