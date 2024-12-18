import assert from 'node:assert'
import { isAsyncFunction } from 'node:util/types'

import { ConfigKey } from '@mwcp/share'
import { context } from '@opentelemetry/api'

import { processDecoratorBeforeAfterSync } from '../decorator.helper.sync.js'
import type { DecoratorExecutorParam } from '../trace.service/index.trace.service.js'
import { AttrNames } from '../types.js'


export function beforeSync(options: DecoratorExecutorParam): void {
  const {
    callerAttr,
    spanName,
    startActiveSpan,
    spanOptions,
    traceService,
  } = options

  const type = 'before'
  const traceContext = options.traceContext ?? traceService.getActiveContext()

  const func = options.mergedDecoratorParam?.[type]
  assert(
    ! func || ! isAsyncFunction(func),
    `[@mwcp/${ConfigKey.namespace}] Trace() ${type}() is a AsyncFunction, but decorated method is sync function, class: ${callerAttr[AttrNames.CallerClass]}, method: ${callerAttr[AttrNames.CallerMethod]}`,
  )
  assert(spanName, 'spanName is empty')

  if (startActiveSpan) {
    const info = traceService.startScopeSpan({ name: spanName, spanOptions, traceContext, scope: options.traceScope })
    options.span = info.span
    options.span.setAttributes(callerAttr)
    options.traceContext = info.traceContext
    context.with(info.traceContext, () => {
      processDecoratorBeforeAfterSync(type, options)
    })
  }
  else {
    // it's necessary to cost a little time to prevent next span.startTime is same as previous span.endTime
    const rndStr = Math.random().toString(36).slice(7)
    void rndStr
    const info = traceService.startSpan(spanName, spanOptions, traceContext, options.traceScope)
    options.span = info.span
    options.span.setAttributes(callerAttr)
    options.traceContext = info.traceContext
    context.with(info.traceContext, () => {
      processDecoratorBeforeAfterSync(type, options)
    })
  }
}

export function afterReturnSync(options: DecoratorExecutorParam): unknown {
  const { span, traceService } = options

  assert(! options.error, `[@mwcp/${ConfigKey.namespace}] options.error is not undefined in afterReturnSync().
  Error: ${options.error?.message}`)

  /* c8 ignore next 3 */
  if (! span) {
    return options.methodResult
  }
  const type = 'after'
  const traceContext = options.traceContext ?? options.traceService.getActiveContext()
  context.with(traceContext, () => {
    processDecoratorBeforeAfterSync(type, options)
  })

  const autoEndSpan = !! options.mergedDecoratorParam?.autoEndSpan
  autoEndSpan && traceService.endSpan({ span, scope: options.traceScope })

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

