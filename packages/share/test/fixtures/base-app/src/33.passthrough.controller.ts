/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import assert from 'node:assert/strict'

import {
  Controller,
  Get,
  Inject,
} from '@midwayjs/core'

import { apiBase, apiMethod } from '../../../api-test.js'

import { PassThrough } from './22.helper2.js'
import { CacheService } from './30.cacheable-async-only.service.js'


@Controller(apiBase.methodCacheable2)
export class ControllerPassthrough {

  @Inject() protected readonly cacheService: CacheService

  idx = 1

  @Get(`/${apiMethod.passthrough}`)
  async simpleAsyncPass(): Promise<number> {
    const ret = await this._simpleAsync(this.idx)
    assert(ret === this.idx)

    this.idx += 1

    const ret2 = this._simpleSync(this.idx)
    assert(ret2 === this.idx)

    this.idx = 1
    return ret2
  }


  // #region protected methods

  @PassThrough()
  protected async _simpleAsync(input: number): Promise<number> {
    return input
  }

  @PassThrough()
  protected _simpleSync(input: number): number {
    return input
  }

}
