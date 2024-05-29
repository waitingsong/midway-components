import assert from 'assert'

import { Singleton } from '@midwayjs/core'

import {
  DecoratorHandlerBase,
  DecoratorExecutorParamBase,
} from '../../../../../src/index.js'



export const METHOD_KEY_Foo = 'decorator:method_key_foo'
export const METHOD_KEY_Foo2 = 'decorator:method_key_foo2'
export const METHOD_KEY_Foo3 = 'decorator:method_key_foo3'
export const METHOD_KEY_Foo4 = 'decorator:method_key_foo4'
export const METHOD_KEY_Foo5 = 'decorator:method_key_foo5'
export const METHOD_KEY_Foo6 = 'decorator:method_key_foo6'
export const METHOD_KEY_Foo7 = 'decorator:method_key_foo7'
export const METHOD_KEY_Foo8 = 'decorator:method_key_foo8'
export const up1 = 1
export const up10 = 10
export const afterThrowMsg = 'afterThrow-test'
export const afterThrowMsgReThrow = 'afterThrow-test2'

export const beforeThrowMsgReThrow = 'beforeThrow-test'
export const beforeThrowMsgSuppressed = 'beforeThrow-suppressed'
export const beforeThrowMsgNoReThrow = 'beforeThrow-no-rethrow'
export const reThrowAtAfter = 'reThrowAtAfter-test'
export const throwAtAfterReturn = 'reThrowAtAfterReturn-test'
export const onlyAfterThrow = 'onlyAfterThrow-test'


export interface FooArgs {
  cacheName: string | undefined
  ttl: number | undefined
}
export async function decoratorExecutorAsync(options: DecoratorExecutorParamBase<FooArgs>): Promise<unknown> {
  assert(options.method)
  const resp = await options.method(...options.methodArgs)
  if (typeof resp === 'number') {
    return new Promise((done) => {
      done(resp + up1)
    })
  }
  return resp
}
export function decoratorExecutorSync(options: DecoratorExecutorParamBase<FooArgs>): unknown {
  assert(options.method)
  const resp = options.method(...options.methodArgs)
  if (typeof resp === 'number') {
    return resp + up1
  }
  return resp
}


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

  override afterThrow(options: DecoratorExecutorParamBase<FooArgs>): number { // return type should be void, but for testing purpose
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

  override afterThrow(options: DecoratorExecutorParamBase<FooArgs>): void {
    assert(this.foo === 1)

    const args = options.methodArgs
    assert(Array.isArray(args) && args.length === 1 && typeof args[0] === 'number')

    assert(options.error instanceof Error)
    assert(options.error.message === afterThrowMsg)
    throw new Error(afterThrowMsgReThrow, { cause: options.error })
  }

  override after(options: DecoratorExecutorParamBase<FooArgs>): void {
    assert(this.foo === 1)

    if (options.error) {
      assert(typeof options.methodResult === 'undefined')
      assert(options.error instanceof Error)
      assert(options.error.message === afterThrowMsg, `error.message: ${options.error.message}, expect: ${afterThrowMsg}`)
    }
    else {
      assert(typeof options.methodResult !== 'undefined')
    }
  }
}


@Singleton()
export class DecoratorHandler4 extends DecoratorHandlerBase {
  readonly msg = beforeThrowMsgReThrow

  override before(options: DecoratorExecutorParamBase<FooArgs>) {
    void options
    throw new Error(this.msg)
  }

  override afterThrow(options: DecoratorExecutorParamBase<FooArgs>): void {
    assert(options.error instanceof Error)
    assert(options.error.message === this.msg)
    throw new Error(this.msg, { cause: options.error })
  }

  override after(options: DecoratorExecutorParamBase<FooArgs>): void {
    assert(typeof options.methodResult === 'undefined')
    assert(options.error instanceof Error)
    assert(options.error.message === this.msg, `error.message: ${options.error.message}, expect: ${afterThrowMsg}`)
  }
}


@Singleton()
export class DecoratorHandler5 extends DecoratorHandlerBase {
  readonly msg = beforeThrowMsgNoReThrow

  override before(options: DecoratorExecutorParamBase<FooArgs>) {
    void options
    throw new Error(this.msg)
  }

  // no re-throw
  override afterThrow(options: DecoratorExecutorParamBase<FooArgs>): void {
    assert(options.error instanceof Error)
    assert(options.error.message === this.msg)
    // throw options.error
  }

  override after(options: DecoratorExecutorParamBase<FooArgs>): void {
    if (options.error) {
      assert(typeof options.methodResult === 'undefined')
      assert(options.error && options.error instanceof Error)
      assert(options.error.message === this.msg, `error.message: ${options.error.message}, expect: ${afterThrowMsg}`)
    }
    else { // error from after(), original method not executed, no result
      assert(typeof options.methodResult === 'undefined')
    }
  }
}


@Singleton()
export class DecoratorHandler6 extends DecoratorHandlerBase {
  readonly msg = Math.random().toString()

  override before(options: DecoratorExecutorParamBase<FooArgs>) {
    void options
    throw new Error(this.msg)
  }

  // no re-throw
  override afterThrow(options: DecoratorExecutorParamBase<FooArgs>): void {
    assert(options.error instanceof Error)
    assert(options.error.message === this.msg)
    // throw options.error
  }

  override after(options: DecoratorExecutorParamBase<FooArgs>): void {
    assert(typeof options.methodResult === 'undefined')
    assert(options.error && options.error instanceof Error)
    assert(options.error.message === this.msg, `error.message: ${options.error.message}, expect: ${afterThrowMsg}`)
    throw new Error(reThrowAtAfter)
  }
}


@Singleton()
export class DecoratorHandler7 extends DecoratorHandlerBase {
  readonly msg = throwAtAfterReturn

  override afterReturn(options: DecoratorExecutorParamBase<FooArgs>): void {
    assert(typeof options.error === 'undefined')
    throw new Error(this.msg)
  }

  override after(options: DecoratorExecutorParamBase<FooArgs>): void {
    assert(typeof options.methodResult === 'number') // original method return value
    // error from afterReturn(), also error thrown even if no throw in after()
    assert(options.error && options.error instanceof Error)
    assert(options.error.message === this.msg, `error.message: ${options.error.message}, expect: ${afterThrowMsg}`)
  }
}


/**
 * Normal aop callback define, suppress error
 * @docs: https://midwayjs.org/docs/aspect
 */
@Singleton()
export class DecoratorHandler8 extends DecoratorHandlerBase {

  override afterThrow(options: DecoratorExecutorParamBase<FooArgs>): void {
    assert(options.error instanceof Error)
    assert(options.error.message === onlyAfterThrow)
  }

  override after(options: DecoratorExecutorParamBase<FooArgs>): void {
    if (options.methodResult) {
      assert(! options.error)
    }
    else {
      assert(options.error instanceof Error)
      assert(options.error.message === onlyAfterThrow)
      // no re-throw, so error is suppressed
    }
  }
}

