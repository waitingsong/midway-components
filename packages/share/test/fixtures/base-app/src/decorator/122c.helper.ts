/* eslint-disable @typescript-eslint/await-thenable */
import assert from 'assert'

import { Singleton } from '@midwayjs/core'

import { isWebContext } from '../types/decorator-helper.js'
import { Context, DecoratorExecutorParamBase, DecoratorHandlerBase, customDecoratorFactory } from '../types/index.js'


export const METHOD_KEY_Bar = 'decorator:method_key_bar'

/**
 * @docs: https://midwayjs.org/docs/aspect
 */
@Singleton()
export class DecoratorHandler122 extends DecoratorHandlerBase {
  readonly foo = 1

  override before(options: DecoratorExecutorParamBase<InputOptions>) {
    assert(this.foo === 1)

    const args = options.methodArgs as [InputOptions, Context?]
    if (args[0].webContext) {
      assert(! args[1])

      const webContext = args[0].webContext
      assert(isWebContext(webContext))
    }
    else {
      assert(! args[0].webContext)

      const webContext = args[1]
      assert(isWebContext(webContext))
    }
    args[0].input += this.foo
  }

  override after(options: DecoratorExecutorParamBase<InputOptions>) {
    const args = options.methodArgs as [InputOptions, Context?]
    if (args[0].webContext) {
      assert(! args[1])

      const webContext = args[0].webContext
      assert(isWebContext(webContext))
    }
    else {
      assert(! args[0].webContext)

      const webContext = args[1]
      assert(isWebContext(webContext))
    }
    assert(args[0].input === this.foo + 1)
  }
}

export function Bar(options?: Partial<InputOptions>) {
  return customDecoratorFactory({
    decoratorArgs: options,
    decoratorKey: METHOD_KEY_Bar,
    decoratorHandlerClass: DecoratorHandler122,
  })
}

export interface InputOptions {
  input: number
  webContext?: Context
}

