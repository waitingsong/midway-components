import { customDecoratorFactory } from '@mwcp/share'

import { MethodType, TraceDecoratorParam } from '../decorator.types.js'


export const KEY_Trace = 'decorator:key_Trace'

/**
 * Declarative Trace Decorator
 *
 * ```
 */
export function Trace<M extends MethodType | void = void>(
  options?: TraceDecoratorParam<M>,
): MethodDecorator {

  const opts = typeof options === 'string'
    ? { spanName: options }
    : options

  return customDecoratorFactory<TraceDecoratorParam<M>>({
    decoratorArgs: opts,
    decoratorKey: KEY_Trace,
    enableClassDecorator: false,
    classIgnoreIfMethodDecortaorKeys: [],
    methodIgnoreIfMethodDecortaorKeys: [],
  })
}

