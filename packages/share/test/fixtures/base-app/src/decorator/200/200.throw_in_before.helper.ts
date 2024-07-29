import assert from 'assert'

import { Singleton } from '@midwayjs/core'

import { type DecoratorExecutorParamBase, DecoratorHandlerBase, customDecoratorFactory } from '../../types/index.js'


export const KEY_throw_in_before = 'decorator:method_key_throw_in_before'

@Singleton()
export class DecoratorHandlerThrowInBefore extends DecoratorHandlerBase {

  override before(options: DecoratorExecutorParamBase<InputOptions>): void | Promise<void> {
    assert(! options.error, 'options.error exists')

    const err = new Error(KEY_throw_in_before)
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
    assert(options.error.message === KEY_throw_in_before, options.error.message)
    assert(! options.errorProcessed, 'options.errorProcessed exists')
    if (options.methodIsAsyncFunction) {
      return Promise.reject(options.error)
    }
    throw options.error
  }

  override after(options: DecoratorExecutorParamBase<InputOptions>): void | Promise<void> {
    assert(options.error, 'options.error not exists, error thrown in before()')
    assert(options.errorProcessed, 'options.errorProcessed not true')
  }
}

export function ThrowInBefore(options?: Partial<InputOptions>) {
  return customDecoratorFactory({
    decoratorArgs: options,
    decoratorKey: KEY_throw_in_before,
    decoratorHandlerClass: DecoratorHandlerThrowInBefore,
  })
}

export interface InputOptions {
  input: number
}

