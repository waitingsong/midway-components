/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import assert from 'node:assert/strict'

import { Controller, Get } from '@midwayjs/core'

import { apiBase, apiMethod } from '../../types/api-test.js'

import { Multi1, Multi2 } from './230.helper.js'


@Controller(apiBase.methodCacheable2)
export class CacheControllerMulti {

  idx = 1

  @Get(`/${apiMethod.multi}`)
  async simple(): Promise<number> {
    const ret = await this._simpleAsync(this.idx)
    assert(ret === this.idx + 2)

    this.idx += 1

    const ret2 = this._simpleSync(this.idx)
    assert(ret2 === this.idx + 2)

    this.idx = 1
    return ret2
  }


  // #region protected methods

  @Multi1(10)
  @Multi2(20)
  protected async _simpleAsync(input: number): Promise<number> {
    return input
  }

  @Multi2()
  @Multi1()
  protected _simpleSync(input: number): number {
    return input
  }

}
