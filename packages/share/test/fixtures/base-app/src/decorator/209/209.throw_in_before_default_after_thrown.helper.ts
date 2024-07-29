import assert from 'assert'

import { Singleton } from '@midwayjs/core'

import { type DecoratorExecutorParamBase, DecoratorHandlerBase, customDecoratorFactory } from '../../types/index.js'


export const KEY_throw_in_before_default_after_throw = 'decorator:method_key_throw_in_before_default_after_throw'

@Singleton()
export class DecoratorHandlerThrowInBeforeDefaultAfterThrow extends DecoratorHandlerBase {

  override before(options: DecoratorExecutorParamBase<InputOptions>): void | Promise<void> {
    assert(! options.error, 'options.error exists')

    const err = new Error(KEY_throw_in_before_default_after_throw)
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

  override after(options: DecoratorExecutorParamBase<InputOptions>): void | Promise<void> {
    assert(options.error, 'options.error not exists, error thrown in before()')
    assert(! options.errorProcessed, 'options.errorProcessed should be false or undefined')
  }
}

export function ThrowInBeforeDefaultAfterThrow(options?: Partial<InputOptions>) {
  return customDecoratorFactory({
    decoratorArgs: options,
    decoratorKey: KEY_throw_in_before_default_after_throw,
    decoratorHandlerClass: DecoratorHandlerThrowInBeforeDefaultAfterThrow,
  })
}

export interface InputOptions {
  input: number
}

