
import assert from 'node:assert/strict'

import { Controller, Get } from '@midwayjs/core'

import { apiBase, apiMethod } from '../../types/api-test.js'

import { MultiDecorate } from './231.helper.js'


@Controller(apiBase.methodCacheable2)
export class CacheControllerMulti {

  idx = 1

  @Get(`/${apiMethod.multi_decorate}`)
  async simple(): Promise<number> {
    const ret = await this._simpleAsync(this.idx)
    assert(ret === this.idx + 3, `ret: ${ret}, this.idx: ${this.idx}`)

    this.idx += 1

    const ret2 = this._simpleSync(this.idx)
    assert(ret2 === this.idx + 2, `ret2: ${ret2}, this.idx: ${this.idx}`)

    this.idx = 1
    return ret2
  }


  // #region protected methods

  @MultiDecorate(10)
  @MultiDecorate(20)
  @MultiDecorate(30)
  protected async _simpleAsync(input: number): Promise<number> {
    return input
  }

  @MultiDecorate()
  @MultiDecorate()
  protected _simpleSync(input: number): number {
    return input
  }

}
