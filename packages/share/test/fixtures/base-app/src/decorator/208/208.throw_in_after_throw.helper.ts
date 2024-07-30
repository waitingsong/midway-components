import assert from 'node:assert'

import { Singleton } from '@midwayjs/core'

import { type DecoratorExecutorParamBase, DecoratorHandlerBase, customDecoratorFactory } from '../../types/index.js'


export const KEY_throw_in_after_throw = 'decorator:method_key_throw_in_after_throw'

@Singleton()
export class DecoratorHandlerThrowInAfterThrow extends DecoratorHandlerBase {

  override before(options: DecoratorExecutorParamBase<InputOptions>): void | Promise<void> {
    assert(! options.error, 'options.error exists')
  }

  override afterReturn(options: DecoratorExecutorParamBase): unknown {
    assert(! options.error, 'options.error exists')
    return options.methodResult
  }

  // this lifecycle method will NOT be called as no error thrown in any lifecycle method
  override afterThrow(options: DecoratorExecutorParamBase): void | Promise<void> {
    assert(! options.error, 'options.error exists')
    assert(! options.errorProcessed.length, 'options.errorProcessed has value')

    const err = new Error(KEY_throw_in_after_throw)
    if (options.methodIsAsyncFunction) {
      return Promise.reject(err)
    }
    throw err
  }

  override after(options: DecoratorExecutorParamBase<InputOptions>): void | Promise<void> {
    assert(! options.error, 'options.error exists')
    assert(! options.errorProcessed.length, 'options.errorProcessed has value')
    assert(typeof options.methodResult === 'number', 'options.methodResult is not number')
  }
}

export function ThrowInAfterThrow(options?: Partial<InputOptions>) {
  return customDecoratorFactory({
    decoratorArgs: options,
    decoratorKey: KEY_throw_in_after_throw,
    decoratorHandlerClass: DecoratorHandlerThrowInAfterThrow,
  })
}

export interface InputOptions {
  input: number
}

