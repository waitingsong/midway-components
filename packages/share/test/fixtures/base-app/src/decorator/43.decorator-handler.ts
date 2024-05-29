import assert from 'assert'

import { Singleton } from '@midwayjs/core'

import {
  DecoratorHandlerBase,
  DecoratorExecutorParamBase,
} from '../../../../../src/index.js'

import {
  FooArgs,
  decoratorExecutorAsync,
  decoratorExecutorSync,
  up10,
  afterThrowMsg,
  afterThrowMsgReThrow,
} from './42.helper.js'


/**
 * @docs: https://midwayjs.org/docs/aspect
 */
@Singleton()
export class DecoratorHandler43 extends DecoratorHandlerBase {
  readonly foo = 1

  override before(options: DecoratorExecutorParamBase<FooArgs>) {
    assert(this.foo === 1)

    const args = options.methodArgs
    assert(Array.isArray(args) && args.length === 1 && typeof args[0] === 'number')

    // @ts-expect-error - testing purpose
    assert(typeof options.bar === 'undefined')

    // @ts-expect-error - testing purpose
    options.bar = args[0] + this.foo
  }

  /**
   * It's necessary to run original method in `around` method manually,
   * the return value of original method is set to `options.methodResult`
   */
  override around(options: DecoratorExecutorParamBase<FooArgs>): unknown {
    assert(this.foo === 1)

    assert(typeof options.methodResult === 'undefined')

    const args = options.methodArgs
    assert(Array.isArray(args) && args.length === 1 && typeof args[0] === 'number')

    // @ts-expect-error - testing purpose
    assert(options.bar === args[0] + this.foo)

    // Do NOT use isAsyncFunction(options.method), result may not correct
    if (options.methodIsAsyncFunction) {
      return decoratorExecutorAsync(options)
    }
    return decoratorExecutorSync(options)
  }

  override afterReturn(options: DecoratorExecutorParamBase<FooArgs>): number {
    assert(this.foo === 1)

    assert(options.error === undefined, 'options.error is not undefined')

    const args = options.methodArgs
    assert(Array.isArray(args) && args.length === 1 && typeof args[0] === 'number')

    // @ts-expect-error - testing purpose
    assert(options.bar === args[0] + this.foo)

    assert(options.methodResult && typeof options.methodResult === 'number')
    return options.methodResult + up10
  }

  override after(options: DecoratorExecutorParamBase<FooArgs>): void {
    assert(this.foo === 1)

    assert(options.error === undefined, 'options.error is not undefined')

    const args = options.methodArgs
    assert(Array.isArray(args) && args.length === 1 && typeof args[0] === 'number')

    // @ts-expect-error - testing purpose
    assert(options.bar === args[0] + this.foo)

    assert(options.methodResult && typeof options.methodResult === 'number')

    assert(typeof options.error === 'undefined')
    // @ts-expect-error - testing purpose return value
    return options.methodResult + up10 // will not change the result, only for test
  }
}

/**
 * @docs: https://midwayjs.org/docs/aspect
 */
@Singleton()
export class DecoratorHandler2 extends DecoratorHandlerBase {
  readonly foo = 1

  override afterThrow(options: DecoratorExecutorParamBase<FooArgs>): unknown {
    assert(this.foo === 1)

    assert(options.error instanceof Error)
    assert(options.error.message === afterThrowMsg)

    const args = options.methodArgs
    assert(Array.isArray(args) && args[0] === 1)

    // @ts-expect-error - testing purpose
    assert(typeof options.bar === 'undefined')
    // @ts-expect-error - testing purpose
    options.bar = this.foo

    return 22 // should throw error or suppress error, 22 to test suppress error and no value returned
  }

  override after(options: DecoratorExecutorParamBase<FooArgs>): void {
    assert(this.foo === 1)

    if (options.error) { // afterThrow
      // @ts-expect-error - testing purpose
      assert(options.bar === this.foo)
    }
    else {
      // @ts-expect-error - testing purpose
      assert(typeof options.bar === 'undefined')
    }

    const args = options.methodArgs
    if (args[0] === 1) { // error triggered
      assert(typeof options.methodResult === 'undefined')
      assert(options.error instanceof Error)
    }
    else {
      assert(options.methodResult)
      assert(! options.error)
    }
  }
}

/**
 * @docs: https://midwayjs.org/docs/aspect
 */
@Singleton()
export class DecoratorHandler3 extends DecoratorHandlerBase {
  readonly foo = 1

  override afterThrow(options: DecoratorExecutorParamBase<FooArgs>): unknown {
    assert(this.foo === 1)

    const args = options.methodArgs
    assert(Array.isArray(args) && args.length === 1 && typeof args[0] === 'number')

    assert(options.error instanceof Error)
    assert(options.error.message === afterThrowMsg)
    throw new Error(afterThrowMsgReThrow, { cause: options.error })
  }

  override after(options: DecoratorExecutorParamBase<FooArgs>): void {
    assert(this.foo === 1)

    assert(typeof options.methodResult === 'undefined')
    assert(options.error && options.error instanceof Error)
    assert(options.error.message === afterThrowMsg)
  }
}

