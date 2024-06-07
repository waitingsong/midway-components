import assert from 'node:assert'

import { processDecoratorBeforeAfterAsync, genTraceScopeFrom } from '../decorator.helper.js'
import type { DecoratorExecutorParam } from '../trace.helper.js'
import { ConfigKey } from '../types.js'


export async function beforeAsync(options: DecoratorExecutorParam): Promise<void> {
  const { traceService } = options

  if (! traceService) { return }

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

  if (! span || ! traceService) {
    return options.methodResult
  }
  await processDecoratorBeforeAfterAsync('after', options)
  return options.methodResult
}

