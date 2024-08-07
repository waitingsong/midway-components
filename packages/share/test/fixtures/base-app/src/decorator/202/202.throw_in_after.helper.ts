import assert from 'node:assert'

import { Singleton } from '@midwayjs/core'

import {
  type DecoratorExecutorParamBase,
  AopLifeCycle,
  DecoratorHandlerBase,
  customDecoratorFactory,
} from '../../types/index.js'


export const KEY_throw_in_after = 'decorator:method_key_throw_in_after'

@Singleton()
export class DecoratorHandlerThrowInAfter extends DecoratorHandlerBase {

  override before(options: DecoratorExecutorParamBase<InputOptions>): void | Promise<void> {
    assert(! options.error, 'options.error exists')
  }

  override afterReturn(options: DecoratorExecutorParamBase): unknown {
    assert(! options.error, 'options.error exists')
    // assert(false, 'should not run here')
    return options.methodResult
  }

  override afterThrow(options: DecoratorExecutorParamBase): void | Promise<void> {
    assert(options.error, 'options.error not exists')
    assert(options.error.message === KEY_throw_in_after, options.error.message)
    const { errorProcessed } = options
    assert(
      ! errorProcessed.length || (errorProcessed.length === 1 && errorProcessed[0] === AopLifeCycle.afterThrow),
      'options.errorProcessed has value (except AopLifeCycle.afterThrow)',
    )
    if (options.methodIsAsyncFunction) {
      return Promise.reject(options.error)
    }
    throw options.error
  }

  override after(options: DecoratorExecutorParamBase<InputOptions>): void | Promise<void> {
    if (options.error) {
      assert(options.errorProcessed.length, 'options.errorProcessed has no value')
    }
    else {
      const err = new Error(KEY_throw_in_after)
      if (options.methodIsAsyncFunction) {
        return Promise.reject(err)
      }
      throw err
    }
  }
}

export function ThrowInAfter(options?: Partial<InputOptions>) {
  return customDecoratorFactory({
    decoratorArgs: options,
    decoratorKey: KEY_throw_in_after,
    decoratorHandlerClass: DecoratorHandlerThrowInAfter,
  })
}

export interface InputOptions {
  input: number
}

