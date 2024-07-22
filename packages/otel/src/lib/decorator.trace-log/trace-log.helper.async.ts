import assert from 'node:assert'

import type { DecoratorExecutorParam } from '../abstract.trace-service.js'
import { processDecoratorBeforeAfterAsync } from '../decorator.helper.async.js'
import { genTraceScopeFrom } from '../decorator.helper.base.js'
import { ConfigKey } from '../types.js'


export async function beforeAsync(options: DecoratorExecutorParam): Promise<void> {
  const { traceService } = options

  const type = 'before'
  const scope = genTraceScopeFrom(options) ?? options.webContext
  if (! options.span) {
    options.span = traceService.getActiveSpan(scope)
  }
  assert(options.webContext, 'beforeAsync() webContext is required')
  return processDecoratorBeforeAfterAsync(options.webContext, type, options)
}

export async function afterReturnAsync(options: DecoratorExecutorParam): Promise<unknown> {
  const { span } = options

  assert(! options.error, `[@mwcp/${ConfigKey.namespace}] options.error is not undefined in afterReturnAsync().
  Error: ${options.error?.message}`)

  /* c8 ignore next 3 */
  if (! span) {
    return options.methodResult
  }
  assert(options.webContext, 'webContext is required')
  await processDecoratorBeforeAfterAsync(options.webContext, 'after', options)
  return options.methodResult
}

export async function afterThrowAsync(options: DecoratorExecutorParam): Promise<void> {
  const { span } = options
  if (! span) { return }

  assert(options.error, `[@mwcp/${ConfigKey.namespace}] options.error is undefined in afterThrowAsync().`)
  assert(options.webContext, 'webContext is required')
  await processDecoratorBeforeAfterAsync(options.webContext, 'afterThrow', options)
}

