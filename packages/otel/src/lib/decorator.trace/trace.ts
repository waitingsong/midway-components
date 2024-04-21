import { customDecoratorFactory } from '@mwcp/share'
import type { MethodTypeUnknown } from '@waiting/shared-types'

import { TraceOptions } from '../decorator.types.js'

import { DecoratorHandlerTrace } from './trace.decorator-handler.js'


export const KEY_Trace = 'decorator:key_Trace'

/**
 * Declarative Trace Decorator
 */
export function Trace<M extends MethodTypeUnknown | undefined = undefined>(options?: TraceOptions<M>): MethodDecorator {

  const opts = typeof options === 'string'
    ? { spanName: options }
    : options

  return customDecoratorFactory({
    decoratorArgs: opts,
    decoratorKey: KEY_Trace,
    enableClassDecorator: false,
    classIgnoreIfMethodDecoratorKeys: [],
    methodIgnoreIfMethodDecoratorKeys: [],
    decoratorHandlerClass: DecoratorHandlerTrace,
  })
}

