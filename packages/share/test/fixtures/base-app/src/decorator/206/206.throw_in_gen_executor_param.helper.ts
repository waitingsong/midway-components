import assert from 'node:assert'

import { Singleton } from '@midwayjs/core'

import { type DecoratorExecutorParamBase, AopLifeCycle, DecoratorHandlerBase, customDecoratorFactory } from '../../types/index.js'


export const KEY_throw_in_gen_executor_param = 'decorator:method_key_throw_in_gen_executor_param'

@Singleton()
export class DecoratorHandlerThrowInGenExecutorParam extends DecoratorHandlerBase {

  override genExecutorParam(
    options: DecoratorExecutorParamBase<InputOptions>,
  ): DecoratorExecutorParamBase<InputOptions> | Promise<DecoratorExecutorParamBase<InputOptions>> {
    assert(! options.error, 'options.error exists')

    const err = new Error(KEY_throw_in_gen_executor_param)
    if (options.methodIsAsyncFunction) {
      return Promise.reject(err)
    }
    throw err
  }

  override before(options: DecoratorExecutorParamBase<InputOptions>): void | Promise<void> {
    void options
    assert(false, 'should not run here')
  }

  override afterReturn(options: DecoratorExecutorParamBase): unknown {
    assert(! options.error, 'options.error exists')
    assert(false, 'should not run here')
    // return options.methodResult
  }

  override afterThrow(options: DecoratorExecutorParamBase): void | Promise<void> {
    assert(options.error, 'options.error not exists')
    assert(options.error.message === KEY_throw_in_gen_executor_param, options.error.message)
    assert(
      ! options.errorProcessed.length || (options.errorProcessed.length === 1 && options.errorProcessed.includes(AopLifeCycle.genExecutorParam)),
      `options.errorProcessed should empty or contains ${AopLifeCycle.genExecutorParam} only`,
    )
    if (options.methodIsAsyncFunction) {
      return Promise.reject(options.error)
    }
    throw options.error
  }

  override after(options: DecoratorExecutorParamBase<InputOptions>): void | Promise<void> {
    assert(options.error, 'options.error not exists, error thrown in before()')
    assert(options.errorProcessed.length, 'options.errorProcessed has no value')
  }
}

export function ThrowInGenExecutorParam(options?: Partial<InputOptions>) {
  return customDecoratorFactory({
    decoratorArgs: options,
    decoratorKey: KEY_throw_in_gen_executor_param,
    decoratorHandlerClass: DecoratorHandlerThrowInGenExecutorParam,
  })
}

export interface InputOptions {
  input: number
}

