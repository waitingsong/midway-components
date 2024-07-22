import { customDecoratorFactory } from '@mwcp/share'
import type { MethodTypeUnknown } from '@waiting/shared-types'

import type { TraceOptions, TraceDecoratorOptions } from '../abstract.trace-service.js'
import { METHOD_KEY_TraceInit } from '../config.js'

import { DecoratorHandlerTraceInit } from './trace-init.decorator-handler.js'


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
export function TraceInit<M extends MethodTypeUnknown | undefined = undefined>(options?: TraceOptions<M>): MethodDecorator & ClassDecorator {

  const opts: Partial<TraceDecoratorOptions<M>> = typeof options === 'string'
    ? { spanName: options }
    : options ?? {}

  if (! opts.spanNameDelimiter) {
    opts.spanNameDelimiter = '.'
  }

  return customDecoratorFactory({
    decoratorArgs: opts,
    decoratorKey: METHOD_KEY_TraceInit,
    enableClassDecorator: false,
    classIgnoreIfMethodDecoratorKeys: [],
    methodIgnoreIfMethodDecoratorKeys: [],
    decoratorHandlerClass: DecoratorHandlerTraceInit,
  })
}

