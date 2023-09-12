import { customDecoratorFactory } from '@mwcp/share'

import { MethodType, TraceDecoratorParam, TraceDecoratorOptions } from '../decorator.types.js'


export const METHOD_KEY_TraceInit = 'decorator:method_key_TraceInit'

/**
 * 声明式中间件初始化装饰器
 * Declarative Trace init Decorator
 *
 * @description 可用于 AutoConfiguration 类中
 * @example ```ts
 * export class AutoConfiguration implements ILifeCycle {
 *   \@TraceInit('INIT Foo.onReady') OR \@TraceInit({ namespace: 'Foo' })
 *   async onReady(container: IMidwayContainer): Promise<void> {
 *     // some code
 *   }
 * }
 * ```
 */
export function TraceInit<M extends MethodType | void = void>(
  options?: TraceDecoratorParam<M>,
): MethodDecorator & ClassDecorator {

  const opts: Partial<TraceDecoratorOptions<M>> = typeof options === 'string'
    ? { spanName: options }
    : options ?? {}

  if (! opts.spanNameDelimiter) {
    opts.spanNameDelimiter = '.'
  }

  return customDecoratorFactory < TraceDecoratorOptions<M>>({
    decoratorArgs: opts,
    decoratorKey: METHOD_KEY_TraceInit,
    enableClassDecorator: false,
    classIgnoreIfMethodDecortaorKeys: [],
    methodIgnoreIfMethodDecortaorKeys: [],
  })
}

