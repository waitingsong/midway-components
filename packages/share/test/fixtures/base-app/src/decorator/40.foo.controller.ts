/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import assert from 'node:assert/strict'

import { Controller, Get } from '@midwayjs/core'

import { apiBase, apiMethod } from '../types/api-test.js'

import {
  Foo, Foo2, Foo3, Foo4, Foo5, Foo6, Foo7, Foo8,
} from './42.helper.js'
import {
  up1, up10,
  afterThrowMsg,
  afterThrowMsgReThrow,
  beforeThrowMsgReThrow,
  reThrowAtAfter,
  throwAtAfterReturn,
  onlyAfterThrow,
} from './43.decorator-handler.js'


@Controller(apiBase.method)
export class MethodController {

  idx = 1

  // #region before, around, after

  @Get(`/${apiMethod.handler}`)
  async simple(): Promise<number> {
    const ret = await this._simple(this.idx)
    assert(ret === this.idx + up1 + up10, ret.toString())

    await this._simple(this.idx)

    this.idx += 1

    const ret2 = this._simpleSync(this.idx)
    assert(ret2 === this.idx + up1 + up10, ret.toString())

    this.idx = 1
    return ret
  }

  @Foo()
  async _simple(input: number): Promise<number> {
    return input
  }

  @Foo()
  _simpleSync(input: number): number {
    return input
  }


  // #region afterThrow ignore

  @Get(`/${apiMethod.after_throw}`)
  async afterThrow(): Promise<'OK'> {
    this.idx = 1
    assert(await this._simple2(this.idx + 1) === this.idx + 1)
    assert(this._simpleSync2(this.idx + 1) === this.idx + 1)

    const ret = await this._simple2(this.idx) // should throw error
    assert(typeof ret === 'undefined', 'ret is not undefined')

    const ret2 = this._simpleSync2(this.idx)
    assert(typeof ret2 === 'undefined')

    return 'OK'
  }

  @Foo2()
  async _simple2(input: number): Promise<number> {
    if (input === 1) {
      throw new Error(afterThrowMsg)
    }
    return input
  }

  @Foo2()
  _simpleSync2(input: number): number {
    if (input === 1) {
      throw new Error(afterThrowMsg)
    }
    return input
  }

  // #region afterThrow re-throw

  @Get(`/${apiMethod.after_throw_re_throw}`)
  async afterThrow3(): Promise<'OK'> {
    this.idx = 1
    try {
      await this._simple3(this.idx)
    }
    catch (ex) {
      assert(ex instanceof Error)
      assert(ex.message === afterThrowMsgReThrow, ex.message)

      try {
        this._simpleSync3(this.idx)
      }
      catch (ex2) {
        assert(ex2 instanceof Error)
        assert(ex2.message === afterThrowMsgReThrow)

        await this._simple3(2)
        this._simpleSync3(2)

        return 'OK'
      }

    }
    assert(false, 'should throw error')
  }

  @Foo3()
  async _simple3(input: number): Promise<number> {
    if (input === 1) {
      throw new Error(afterThrowMsg)
    }
    return input
  }

  @Foo3()
  _simpleSync3(input: number): number {
    if (input === 1) {
      throw new Error(afterThrowMsg)
    }
    return input
  }


  // #region beforeThrow re-throw

  @Get(`/${apiMethod.before_throw_re_throw}`)
  async simple4(): Promise<'OK'> {
    this.idx = 1
    try {
      await this._simple4(this.idx)
    }
    catch (ex) {
      assert(ex instanceof Error)
      assert(ex.message === beforeThrowMsgReThrow, ex.message)

      try {
        this._simpleSync4(this.idx)
      }
      catch (ex2) {
        assert(ex2 instanceof Error)
        assert(ex2.message === beforeThrowMsgReThrow)

        try {
          await this._simple4(2)
        }
        catch (ex3) {
          assert(ex3 instanceof Error)
          assert(ex3.message === beforeThrowMsgReThrow)

          try {
            this._simpleSync4(2)
          }
          catch (ex4) {
            assert(ex4 instanceof Error)
            assert(ex4.message === beforeThrowMsgReThrow)

            return 'OK'
          }
        }

      }

    }
    assert(false, 'should throw error')
  }

  @Foo4()
  async _simple4(input: number): Promise<number> {
    if (input === 1) {
      throw new Error(afterThrowMsg)
    }
    return input
  }

  @Foo4()
  _simpleSync4(input: number): number {
    if (input === 1) {
      throw new Error(afterThrowMsg)
    }
    return input
  }


  // #region beforeThrow suppress

  @Get(`/${apiMethod.before_throw_no_re_throw}`)
  async beforeThrow5(): Promise<'OK'> {
    this.idx = 1
    await this._simple5(this.idx)
    this._simpleSync5(this.idx)

    await this._simple5(2)
    this._simpleSync5(2)
    return 'OK'
  }

  @Foo5()
  async _simple5(input: number): Promise<number> {
    if (input === 1) {
      throw new Error(afterThrowMsg)
    }
    return input
  }

  @Foo5()
  _simpleSync5(input: number): number {
    if (input === 1) {
      throw new Error(afterThrowMsg)
    }
    return input
  }

  // #region re throw at after

  @Get(`/${apiMethod.re_throw_at_after}`)
  async beforeThrow6(): Promise<'OK'> {
    this.idx = 1
    try {
      await this._simple6(this.idx)
    }
    catch (ex) {
      assert(ex instanceof Error)
      assert(ex.message === reThrowAtAfter, ex.message)

      try {
        this._simpleSync6(this.idx)
      }
      catch (ex2) {
        assert(ex2 instanceof Error)
        assert(ex2.message === reThrowAtAfter)
        return 'OK'
      }

    }
    assert(false, 'should throw error')
  }

  @Foo6()
  async _simple6(input: number): Promise<number> {
    if (input === 1) {
      throw new Error(afterThrowMsg)
    }
    return input
  }

  @Foo6()
  _simpleSync6(input: number): number {
    if (input === 1) {
      throw new Error(afterThrowMsg)
    }
    return input
  }

  // #region re throw at afterReturn

  @Get(`/${apiMethod.throw_at_after_return}`)
  async simple7(): Promise<'OK'> {
    this.idx = 1
    try {
      await this._simple7(this.idx)
    }
    catch (ex) {
      assert(ex instanceof Error)
      assert(ex.message === throwAtAfterReturn, ex.message)

      try {
        this._simpleSync7(this.idx)
      }
      catch (ex2) {
        assert(ex2 instanceof Error)
        assert(ex2.message === throwAtAfterReturn)
        return 'OK'
      }

    }
    assert(false, 'should throw error')
  }

  @Foo7()
  async _simple7(input: number): Promise<number> {
    return input
  }

  @Foo7()
  _simpleSync7(input: number): number {
    return input
  }

  // #region suppress error

  /**
   * Normal aop callback define, suppress error
   * @docs: https://midwayjs.org/docs/aspect
   */
  @Get(`/${apiMethod.normal_aop}`)
  async simple8(): Promise<'OK'> {
    this.idx = 1
    await this._simple8(this.idx)
    this._simpleSync8(this.idx)

    await this._simple8(2)
    this._simpleSync8(2)
    return 'OK'
  }

  @Foo8()
  async _simple8(input: number): Promise<number> {
    if (input === 1) {
      throw new Error(onlyAfterThrow)
    }
    return input
  }

  @Foo8()
  _simpleSync8(input: number): number {
    if (input === 1) {
      throw new Error(onlyAfterThrow)
    }
    return input
  }


}
