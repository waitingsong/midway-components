import assert from 'node:assert'

import { processDecoratorBeforeAfterAsync } from '../decorator.helper.async.js'
import { genTraceScopeFrom } from '../decorator.helper.js'
import type { DecoratorExecutorParam } from '../trace.helper.js'
import { ConfigKey } from '../types.js'


export async function beforeAsync(options: DecoratorExecutorParam): Promise<void> {
  const { traceService } = options
  assert(traceService, 'traceService is required')

  const type = 'before'
  if (! options.span) {
    const scope = genTraceScopeFrom(options)
    options.span = traceService.getActiveSpan(scope)
  }
  return processDecoratorBeforeAfterAsync(type, options)
}

export async function afterReturnAsync(options: DecoratorExecutorParam): Promise<unknown> {
  const { span, traceService } = options

  assert(! options.error, `[@mwcp/${ConfigKey.namespace}] options.error is not undefined in afterReturnAsync().
  Error: ${options.error?.message}`)

  /* c8 ignore next 3 */
  if (! span || ! traceService) {
    return options.methodResult
  }
  await processDecoratorBeforeAfterAsync('after', options)
  return options.methodResult
}

export async function afterThrowAsync(options: DecoratorExecutorParam): Promise<void> {
  const { span, traceService } = options
  if (! span || ! traceService) { return }

  assert(options.error, `[@mwcp/${ConfigKey.namespace}] options.error is undefined in afterThrowAsync().`)
  await processDecoratorBeforeAfterAsync('afterThrow', options)
}

