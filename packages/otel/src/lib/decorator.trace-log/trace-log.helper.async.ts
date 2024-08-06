import assert from 'node:assert'

import { processDecoratorBeforeAfterAsync } from '../decorator.helper.async.js'
import { genTraceScopeFrom } from '../decorator.helper.base.js'
import type { DecoratorExecutorParam } from '../trace.service.js'
import { ConfigKey } from '../types.js'


export async function beforeAsync(options: DecoratorExecutorParam): Promise<void> {
  const { traceService } = options

  const type = 'before'
  options.traceScope = genTraceScopeFrom(options) ?? options.webContext

  assert(options.traceScope, 'beforeAsync() options.traceScope is required')
  if (! options.span) {
    options.span = traceService.getActiveSpan(options.traceScope)
  }
  return processDecoratorBeforeAfterAsync(type, options)
}

export async function afterReturnAsync(options: DecoratorExecutorParam): Promise<unknown> {
  const { span } = options

  assert(! options.error, `[@mwcp/${ConfigKey.namespace}] options.error is not undefined in afterReturnAsync().
  Error: ${options.error?.message}`)

  /* c8 ignore next 3 */
  if (! span) {
    return options.methodResult
  }
  await processDecoratorBeforeAfterAsync('after', options)
  return options.methodResult
}

export async function afterThrowAsync(options: DecoratorExecutorParam): Promise<void> {
  const { span } = options
  if (! span) { return }

  assert(options.error, `[@mwcp/${ConfigKey.namespace}] options.error is undefined in afterThrowAsync().`)
  await processDecoratorBeforeAfterAsync('afterThrow', options)
}

