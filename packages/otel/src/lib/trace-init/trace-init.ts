/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from 'assert'

import { customDecoratorFactory } from '@mwcp/share'

import { MethodType, TraceDecoratorArg } from '../types'


export const METHOD_KEY_TraceInit = 'decorator:method_key_TraceInit'

/**
 * 声明式中间件初始化装饰器
 * Declarative Trace init Decorator
 *
 * @description 可用于 AutoConfiguration 类中
 * @example ```ts
 * export class AutoConfiguration implements ILifeCycle {
 *   \@TraceInit('INIT Foo.onReady')
 *   async onReady(container: IMidwayContainer): Promise<void> {
 *     // some code
 *   }
 * }
 * ```
 */
export function TraceInit<M extends MethodType | undefined = undefined>(
  options: TraceDecoratorArg<M>,
): MethodDecorator & ClassDecorator {

  const opts = typeof options === 'string'
    ? { spanName: options }
    : options

  assert(opts.spanName, 'spanName is required for TraceInit decorator. (TraceInit 装饰器需要 spanName 参数)')

  return customDecoratorFactory<TraceDecoratorArg<M>>({
    decoratorArgs: opts,
    decoratorKey: METHOD_KEY_TraceInit,
    enableClassDecorator: false,
    classIgnoreIfMethodDecortaorKeys: [],
    methodIgnoreIfMethodDecortaorKeys: [],
  })
}

