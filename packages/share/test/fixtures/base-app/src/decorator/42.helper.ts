import { customDecoratorFactory } from '../types/index.js'

import {
  DecoratorHandler43,
  DecoratorHandler2,
  DecoratorHandler3,
  DecoratorHandler4,
  DecoratorHandler5,
  DecoratorHandler6,
  DecoratorHandler7,
  DecoratorHandler8,

  METHOD_KEY_Foo,
  METHOD_KEY_Foo2,
  METHOD_KEY_Foo3,
  METHOD_KEY_Foo4,
  METHOD_KEY_Foo5,
  METHOD_KEY_Foo6,
  METHOD_KEY_Foo7,
  METHOD_KEY_Foo8,
} from './43.decorator-handler.js'
import type { FooArgs } from './43.decorator-handler.js'


export function Foo(options?: Partial<FooArgs>) {
  return customDecoratorFactory({
    decoratorArgs: options,
    decoratorKey: METHOD_KEY_Foo,
    decoratorHandlerClass: DecoratorHandler43,
  })
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

export function Foo4(options?: Partial<FooArgs>) {
  return customDecoratorFactory({
    decoratorArgs: options,
    decoratorKey: METHOD_KEY_Foo4,
    decoratorHandlerClass: DecoratorHandler4,
  })
}

export function Foo5(options?: Partial<FooArgs>) {
  return customDecoratorFactory({
    decoratorArgs: options,
    decoratorKey: METHOD_KEY_Foo5,
    decoratorHandlerClass: DecoratorHandler5,
  })
}

export function Foo6(options?: Partial<FooArgs>) {
  return customDecoratorFactory({
    decoratorArgs: options,
    decoratorKey: METHOD_KEY_Foo6,
    decoratorHandlerClass: DecoratorHandler6,
  })
}

export function Foo7(options?: Partial<FooArgs>) {
  return customDecoratorFactory({
    decoratorArgs: options,
    decoratorKey: METHOD_KEY_Foo7,
    decoratorHandlerClass: DecoratorHandler7,
  })
}

/**
 * Normal aop callback define, suppress error
 */
export function Foo8(options?: Partial<FooArgs>) {
  return customDecoratorFactory({
    decoratorArgs: options,
    decoratorKey: METHOD_KEY_Foo8,
    decoratorHandlerClass: DecoratorHandler8,
  })
}

