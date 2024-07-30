import assert from 'node:assert'

import { Singleton } from '@midwayjs/core'

import { type DecoratorExecutorParamBase, DecoratorHandlerBase, customDecoratorFactory } from '../../types/index.js'


export const KEY_eat_throw_in_before = 'decorator:method_key_eat_throw_in_before'

@Singleton()
export class DecoratorHandlerEatThrowInBefore extends DecoratorHandlerBase {

  override before(options: DecoratorExecutorParamBase<InputOptions>): void | Promise<void> {
    assert(! options.error, 'options.error exists')

    const err = new Error(KEY_eat_throw_in_before)
    if (options.methodIsAsyncFunction) {
      return Promise.reject(err)
    }
    throw err
  }

  override afterReturn(options: DecoratorExecutorParamBase): unknown {
    assert(! options.error, 'options.error exists')
    return options.methodResult
  }

  override afterThrow(options: DecoratorExecutorParamBase): void | Promise<void> {
    assert(options.error, 'options.error not exists')
    assert(options.error.message === KEY_eat_throw_in_before, options.error.message)
    assert(! options.errorProcessed.length, 'options.errorProcessed has value')
    // not re-throw
  }

  override after(options: DecoratorExecutorParamBase<InputOptions>): void | Promise<void> {
    assert(! options.error, 'options.error exists')
    assert(typeof options?.methodResult === 'number', 'methodResult not number')
  }
}

export function EatThrowInBefore(options?: Partial<InputOptions>) {
  return customDecoratorFactory({
    decoratorArgs: options,
    decoratorKey: KEY_eat_throw_in_before,
    decoratorHandlerClass: DecoratorHandlerEatThrowInBefore,
  })
}

export interface InputOptions {
  input: number
}

