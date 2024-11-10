import assert from 'node:assert'

import { context } from '@opentelemetry/api'

import { processDecoratorBeforeAfterAsync } from '../decorator.helper.async.js'
import type { DecoratorExecutorParam } from '../trace.service/index.trace.service.js'
import { ConfigKey } from '../types.js'


export async function beforeAsync(options: DecoratorExecutorParam): Promise<void> {
  const {
    callerAttr,
    spanName,
    startActiveSpan,
    spanOptions,
    traceService,
  } = options

  const type = 'before'
  const traceContext = options.traceContext ?? traceService.getActiveContext()

  if (startActiveSpan) {
    const info = traceService.startScopeSpan({ name: spanName, spanOptions, traceContext, scope: options.traceScope })
    options.span = info.span
    options.span.setAttributes(callerAttr)
    options.traceContext = info.traceContext
    await context.with(info.traceContext, async () => {
      await processDecoratorBeforeAfterAsync(type, options)
    })
    return
  }
  else {
    // it's necessary to cost a little time to prevent next span.startTime is same as previous span.endTime
    const rndStr = Math.random().toString(36).slice(7)
    void rndStr
    const info = traceService.startSpan(spanName, spanOptions, traceContext, options.traceScope)
    options.span = info.span
    options.span.setAttributes(callerAttr)
    options.traceContext = info.traceContext
    await context.with(info.traceContext, async () => {
      await processDecoratorBeforeAfterAsync(type, options)
    })
    return
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
  const traceContext = options.traceContext ?? traceService.getActiveContext()
  await context.with(traceContext, async () => {
    await processDecoratorBeforeAfterAsync(type, options)
  })

  const autoEndSpan = !! options.mergedDecoratorParam?.autoEndSpan
  autoEndSpan && traceService.endSpan({ span, scope: options.webContext })

  return options.methodResult
}

export async function afterThrowAsync(options: DecoratorExecutorParam): Promise<void> {
  const { span } = options
  if (! span) { return }

  assert(options.error, `[@mwcp/${ConfigKey.namespace}] options.error is undefined in afterThrowAsync().`)
  const type = 'afterThrow'
  const traceContext = options.traceContext ?? options.traceService.getActiveContext()
  await context.with(traceContext, async () => {
    await processDecoratorBeforeAfterAsync(type, options)
  })
}

