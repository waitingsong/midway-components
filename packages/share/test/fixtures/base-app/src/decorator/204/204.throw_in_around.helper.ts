import assert from 'node:assert'

import { Singleton } from '@midwayjs/core'

import { type DecoratorExecutorParamBase, DecoratorHandlerBase, customDecoratorFactory } from '../../types/index.js'


export const KEY_throw_in_around = 'decorator:method_key_throw_in_around'

@Singleton()
export class DecoratorHandlerThrowInAround extends DecoratorHandlerBase {

  override before(options: DecoratorExecutorParamBase<InputOptions>): void | Promise<void> {
    assert(! options.error, 'options.error exists')
  }

  override around(options: DecoratorExecutorParamBase<InputOptions>): unknown {
    assert(! options.error, 'options.error exists')

    const err = new Error(KEY_throw_in_around)
    if (options.methodIsAsyncFunction) {
      return Promise.reject(err)
    }
    throw err
  }

  override afterReturn(options: DecoratorExecutorParamBase): unknown {
    assert(! options.error, 'options.error exists')
    assert(false, 'should not run here')
    // return options.methodResult
  }

  override afterThrow(options: DecoratorExecutorParamBase): void | Promise<void> {
    assert(options.error, 'options.error not exists')
    assert(options.error.message === KEY_throw_in_around, options.error.message)
    assert(! options.errorProcessed.length, 'options.errorProcessed has value')
    if (options.methodIsAsyncFunction) {
      return Promise.reject(options.error)
    }
    throw options.error
  }

  override after(options: DecoratorExecutorParamBase<InputOptions>): void | Promise<void> {
    assert(options.error, 'options.error not exists, error thrown in around()')
    assert(options.errorProcessed.length, 'options.errorProcessed has no value')
  }
}

export function ThrowInAround(options?: Partial<InputOptions>) {
  return customDecoratorFactory({
    decoratorArgs: options,
    decoratorKey: KEY_throw_in_around,
    decoratorHandlerClass: DecoratorHandlerThrowInAround,
  })
}

export interface InputOptions {
  input: number
}

