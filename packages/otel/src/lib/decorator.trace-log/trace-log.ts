import { customDecoratorFactory } from '@mwcp/share'
import type { MethodTypeUnknown } from '@waiting/shared-types'

import { METHOD_KEY_TraceLog } from '../config.js'
import type { TraceOptions } from '../decorator.types.js'

import { DecoratorHandlerTraceLog } from './trace-log.decorator-handler.js'


/**
 * Declarative TraceLog Decorator,
 * add trace attribute to the span through decorator before()/after() method return object,
 * no new span starting
 * - add trace tag/log to current active span
 * - add trace tag/log to root span
 * @note return value of decorated method `before()` and `after()` should be type:
 * ```ts
 * interface DecoratorTraceData {
 *   attrs?: Attributes
 *   events?: Attributes
 *   rootAttrs?: Attributes
 *   rootEvents?: Attributes
 * }
 * ```
 */
export function TraceLog<M extends MethodTypeUnknown | undefined = undefined>(options?: TraceOptions<M>): MethodDecorator {

  const opts = typeof options === 'string'
    ? { spanName: options }
    : options

  return customDecoratorFactory({
    decoratorArgs: opts,
    decoratorKey: METHOD_KEY_TraceLog,
    enableClassDecorator: false,
    classIgnoreIfMethodDecoratorKeys: [],
    methodIgnoreIfMethodDecoratorKeys: [],
    decoratorHandlerClass: DecoratorHandlerTraceLog,
  })
}

