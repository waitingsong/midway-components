/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import assert from 'node:assert/strict'

import {
  Controller,
  Get,
} from '@midwayjs/core'

import { apiBase, apiMethod } from '../../../../api-test.js'

import { Foo, Foo2, Foo3, up1, up10, afterThrowMsg, afterThrowMsgReThrow } from './42.helper.js'


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

}
