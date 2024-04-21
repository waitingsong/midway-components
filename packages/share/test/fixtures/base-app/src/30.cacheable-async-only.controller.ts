/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import assert from 'node:assert/strict'

import {
  Controller,
  Get,
  Inject,
} from '@midwayjs/core'

import { apiBase, apiMethod } from '../../../api-test.js'

import { CacheableAsyncOnly2 } from './22.helper2.js'
import { CacheService } from './30.cacheable-async-only.service.js'


@Controller(apiBase.methodCacheable2)
export class CacheControllerAsyncOnly {

  @Inject() protected readonly cacheService: CacheService

  idx = 1

  @Get(`/${apiMethod.simpleAsyncOnly}`)
  async simpleAsyncOnly(): Promise<number> {
    const ret = await this._simpleAsync(this.idx)
    assert(ret === this.idx + 1)

    try {
      this._simpleSync(this.idx)
    }
    catch (ex) {
      assert(ex instanceof Error)
      assert(ex.message.includes('[@mwcp/share] Sync method is not supported default'), ex.message)
      return ret
    }

    throw new Error('should not reach here')
  }


  // #region protected methods

  @CacheableAsyncOnly2()
  protected async _simpleAsync(input: number): Promise<number> {
    return input
  }

  @CacheableAsyncOnly2()
  protected _simpleSync(input: number): number {
    return input
  }

}
