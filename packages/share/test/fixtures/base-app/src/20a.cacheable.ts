/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import assert from 'node:assert/strict'

import {
  Controller,
  Get,
} from '@midwayjs/core'

import { apiPrefix, apiRoute } from '../../../api-route.js'

import { Cacheable, CacheableSyncOnly, CacheableSyncWithAsyncBypass } from './helper.js'


@Controller(apiPrefix.methodCacheable)
export class CacheController {

  readonly controllerName = 'CacheController'
  idx = 1

  @Get(`/${apiRoute.simple}`)
  async simple(): Promise<number> {
    const ret = await this._simple(this.idx)
    assert(ret === this.idx + 1)

    this.idx += 1

    const ret2 = this._simpleSync(this.idx)
    assert(ret2 === this.idx + 1)

    this.idx = 1
    return ret
  }

  @Get(`/${apiRoute.simpleSyncWithAsyncBypass}`)
  async simpleSyncWithAsyncPass(): Promise<number> {
    const ret = this._simpleSync(this.idx)
    assert(ret === this.idx + 1)

    this.idx += 1

    const ret2 = await this._simple4(this.idx)
    assert(ret2 === this.idx) // not changed

    this.idx = 1
    return ret
  }

  @Get(`/${apiRoute.simpleSyncOnly}`)
  async simpleSyncOnly(): Promise<number> {
    const ret = this._simpleSync6(this.idx)
    assert(ret === this.idx + 1)

    try {
      const ret2 = await this._simple5(this.idx)
      assert(ret2 === this.idx) // not changed
    }
    catch (ex) {
      assert(ex instanceof Error)
      assert(ex.message.includes('CacheController._simple5()'))
      assert(ex.message.includes('executorAsync config is false'))
      this.idx = 1
      return ret
    }

    this.idx = 1
    throw new Error('should not reach here')
  }


  @Cacheable()
  async _simple(input: number): Promise<number> {
    return input
  }

  @Cacheable()
  _simpleSync(input: number): number {
    return input
  }


  @CacheableSyncWithAsyncBypass()
  _simple3(input: number): number {
    return input
  }

  @CacheableSyncWithAsyncBypass()
  async _simple4(input: number): Promise<number> {
    return input
  }


  @CacheableSyncOnly()
  async _simple5(input: number): Promise<number> {
    return input
  }

  @CacheableSyncOnly()
  _simpleSync6(input: number): number {
    return input
  }

}
