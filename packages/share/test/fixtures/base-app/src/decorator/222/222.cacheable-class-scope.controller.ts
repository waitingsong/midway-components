/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import assert from 'node:assert/strict'

import { Controller, Get } from '@midwayjs/core'

import { apiBase, apiMethod } from '../../types/api-test.js'

import { CacheableRequest } from './222.helper.js'


@Controller(apiBase.methodCacheable2)
export class CacheControllerScope {

  idx = 1

  @Get(`/${apiMethod.simpleRequest}`)
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

  @CacheableRequest()
  async _simpleAsync(input: number): Promise<number> {
    return input
  }

  @CacheableRequest()
  _simpleSync(input: number): number {
    return input
  }

}
