/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import assert from 'node:assert/strict'

import {
  Controller,
  Get,
} from '@midwayjs/core'

import { apiBase, apiMethod } from '../../../api-test.js'

import { CacheableSyncOnly2 } from './22.helper2.js'


@Controller(apiBase.methodCacheable2)
export class CacheControllerSyncOnly {

  idx = 1

  @Get(`/${apiMethod.simpleSyncOnly}`)
  async simpleSyncOnly(): Promise<number> {
    const ret = this._simpleSync(this.idx)
    assert(ret === this.idx + 1)

    try {
      await this._simpleAsync(this.idx)
    }
    catch (ex) {
      assert(ex instanceof Error)
      assert(ex.message.includes('[@mwcp/share] Async method is not supported default'))
      return ret
    }

    throw new Error('should not reach here')
  }


  // #region protected methods

  @CacheableSyncOnly2()
  async _simpleAsync(input: number): Promise<number> {
    return input
  }

  @CacheableSyncOnly2()
  _simpleSync(input: number): number {
    return input
  }

}
