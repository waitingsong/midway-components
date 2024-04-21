/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import assert from 'node:assert/strict'

import {
  Controller,
  Get,
} from '@midwayjs/core'

import { apiBase, apiMethod } from '../../../api-test.js'

import { Cacheable2, CacheableNumber } from './22.helper2.js'


@Controller(apiBase.methodCacheable2)
export class CacheController2 {

  readonly controllerName = 'CacheController'
  idx = 1

  @Get(`/${apiMethod.simple}`)
  async simple(): Promise<number> {
    const ret = await this._simpleAsync(this.idx)
    assert(ret === this.idx + 1)

    this.idx += 1

    const ret2 = this._simpleSync(this.idx)
    assert(ret2 === this.idx + 1)

    this.idx = 1
    return ret
  }


  @Get(`/${apiMethod.simpleNumber}`)
  async simpleNumber(): Promise<number> {
    const ret = await this._simpleAsyncNumber(this.idx)
    assert(ret === this.idx + 10) // 11

    this.idx += 1

    const ret2 = this._simpleSyncNumber(this.idx)
    assert(ret2 === this.idx + 20) // 22

    this.idx = 1
    return ret2
  }

  // #region private methods

  @Cacheable2()
  async _simpleAsync(input: number): Promise<number> {
    return input
  }

  @Cacheable2()
  _simpleSync(input: number): number {
    return input
  }


  @CacheableNumber(10)
  async _simpleAsyncNumber(input: number): Promise<number> {
    return input
  }

  @CacheableNumber(20)
  _simpleSyncNumber(input: number): number {
    return input
  }

}
