import { customDecoratorFactory } from '@mwcp/share'
import type { MethodTypeUnknown } from '@waiting/shared-types'

import type { TraceOptions } from '../abstract.trace-service.js'
import { KEY_Trace } from '../config.js'

import { DecoratorHandlerTrace } from './trace.decorator-handler.js'


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

