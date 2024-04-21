/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import assert from 'node:assert/strict'

import {
  Controller,
  Get,
} from '@midwayjs/core'

import { apiBase, apiMethod } from '../../../api-test.js'

import { Cacheable2 } from './22.helper2.js'


@Controller(apiBase.methodCacheable2)
@Cacheable2()
export class CacheControllerClassOnly2 {

  idx = 1

  @Get(`/${apiMethod.simpleClassOnly2}`)
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
  async _simpleAsync(input: number): Promise<number> {
    return input
  }

  _simpleSync(input: number): number {
    return input
  }

}

