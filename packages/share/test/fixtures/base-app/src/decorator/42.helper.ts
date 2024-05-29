import assert from 'assert'

import { DecoratorExecutorParamBase, customDecoratorFactory } from '../../../../../src/index.js'

import { DecoratorHandler43, DecoratorHandler2, DecoratorHandler3 } from './43.decorator-handler.js'


export const METHOD_KEY_Foo = 'decorator:method_key_foo'
export const METHOD_KEY_Foo2 = 'decorator:method_key_foo2'
export const METHOD_KEY_Foo3 = 'decorator:method_key_foo3'
export const up1 = 1
export const up10 = 10
export const afterThrowMsg = 'afterThrow-test'
export const afterThrowMsgReThrow = 'afterThrow-test2'

export function Foo(options?: Partial<FooArgs>) {
  return customDecoratorFactory({
    decoratorArgs: options,
    decoratorKey: METHOD_KEY_Foo,
    decoratorHandlerClass: DecoratorHandler43,
  })
}

export interface FooArgs {
  cacheName: string | undefined
  ttl: number | undefined
}

export async function decoratorExecutorAsync(options: DecoratorExecutorParamBase<FooArgs>): Promise<unknown> {
  assert(options.method)
  const resp = await options.method(...options.methodArgs)
  if (typeof resp === 'number') {
    return new Promise((done) => {
      done(resp + up1)
    })
  }
  return resp
}
export function decoratorExecutorSync(options: DecoratorExecutorParamBase<FooArgs>): unknown {
  assert(options.method)
  const resp = options.method(...options.methodArgs)
  if (typeof resp === 'number') {
    return resp + up1
  }
  return resp
}


export function Foo2(options?: Partial<FooArgs>) {
  return customDecoratorFactory({
    decoratorArgs: options,
    decoratorKey: METHOD_KEY_Foo2,
    decoratorHandlerClass: DecoratorHandler2,
  })
}


export function Foo3(options?: Partial<FooArgs>) {
  return customDecoratorFactory({
    decoratorArgs: options,
    decoratorKey: METHOD_KEY_Foo3,
    decoratorHandlerClass: DecoratorHandler3,
  })
}
