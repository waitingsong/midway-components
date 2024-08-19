/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import assert from 'node:assert'

import { Controller, Get } from '@midwayjs/core'

import { ttl10, ttl20, ttl40 } from '../../helper.js'
import { apiBase, apiMethod } from '../../types/api-test.js'

import { CacheableMix } from './223.helper.js'


@Controller(apiBase.methodCacheable2)
@CacheableMix({
  ttl: ttl10,
})
export class CacheControllerMix {

  readonly controllerName = 'CacheController'
  idx = 1

  @Get(`/${apiMethod.simpleMix}`)
  @CacheableMix({
    ttl: ttl20,
  })
  // @CacheableMix({
  //   cacheName: 'foo',
  // })
  async simple(): Promise<number> {
    const ret = await this._simpleAsync(this.idx)
    assert(ret === this.idx + 1)

    this.idx += 1

    const ret2 = this._simpleSync(this.idx)
    assert(ret2 === this.idx + 1)

    this.idx = 1
    return ret
  }


  // #region private methods

  @CacheableMix({
    ttl: ttl40,
  })
  async _simpleAsync(input: number): Promise<number> {
    return input
  }

  @CacheableMix()
  _simpleSync(input: number): number {
    return input
  }

}

