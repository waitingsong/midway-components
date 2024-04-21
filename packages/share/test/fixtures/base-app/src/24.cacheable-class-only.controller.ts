/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import assert from 'node:assert/strict'

import {
  Controller,
  Get,
} from '@midwayjs/core'

import { apiBase, apiMethod } from '../../../api-test.js'

import { CacheableRequest } from './22.helper2.js'


@Controller(apiBase.methodCacheable2)
@CacheableRequest()
export class CacheControllerClassOnly {

  idx = 1

  @Get(`/${apiMethod.simpleClassOnly}`)
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

