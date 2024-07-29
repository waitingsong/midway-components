import assert from 'node:assert'

import { Singleton } from '@midwayjs/core'

import { type DecoratorExecutorParamBase, DecoratorHandlerBase, customDecoratorFactory } from '../../types/index.js'


export const KEY_eat_throw_in_around = 'decorator:method_key_eat_throw_in_around'

@Singleton()
export class DecoratorHandlerEatThrowInAround extends DecoratorHandlerBase {

  override before(options: DecoratorExecutorParamBase<InputOptions>): void | Promise<void> {
    assert(! options.error, 'options.error exists')
  }

  override around(options: DecoratorExecutorParamBase<InputOptions>): unknown {
    assert(! options.error, 'options.error exists')

    const err = new Error(KEY_eat_throw_in_around)
    if (options.methodIsAsyncFunction) {
      return Promise.reject(err)
    }
    throw err
  }

  override afterReturn(options: DecoratorExecutorParamBase): unknown {
    assert(! options.error, 'options.error exists')
    // assert(false, 'should not run here')
    assert(typeof options.methodResult === 'undefined', 'options.methodResult should undefined, as error thrown in around() and return none')
    return
  }

  override afterThrow(options: DecoratorExecutorParamBase): void | Promise<void> {
    assert(options.error, 'options.error not exists')
    assert(options.error.message === KEY_eat_throw_in_around, options.error.message)
    assert(! options.errorProcessed, 'options.errorProcessed exists')
    // not re-throw
  }

  override after(options: DecoratorExecutorParamBase<InputOptions>): void | Promise<void> {
    assert(! options.error, 'options.error exists')
    assert(typeof options.methodResult === 'undefined', 'options.methodResult should undefined, as error thrown in around() and return none')
    // assert(options.error, 'options.error not exists, error thrown in around()')
    // assert(options.errorProcessed, 'options.errorProcessed not true')
  }
}

export function EatThrowInAround(options?: Partial<InputOptions>) {
  return customDecoratorFactory({
    decoratorArgs: options,
    decoratorKey: KEY_eat_throw_in_around,
    decoratorHandlerClass: DecoratorHandlerEatThrowInAround,
  })
}

export interface InputOptions {
  input: number
}

