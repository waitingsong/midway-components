/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import assert from 'node:assert/strict'

import {
  Controller,
  Get,
} from '@midwayjs/core'

import { Cacheable } from '../../../../../dist/index.js'
import { CachedResponse } from '../../../../../dist/lib/types.js'
import { apiBase, apiMethod } from '../../../../api-test.js'


@Controller(apiBase.method_cacheable)
export class DecoratorControllerAfterThrow {

  @Get(`/${apiMethod.after_throw}`)
  async afterThrow(): Promise<'OK'> {
    // const ret = await this._simple()
    // assert(ret.value === 'OK')

    try {
      await this._simple(1)
    }
    catch (ex) {
      assert(ex instanceof Error)
      assert(ex.message === 'test', ex.message)

      return 'OK'
    }

    assert(false, 'Should throw error')
  }

  @Cacheable()
  protected async _simple(input = 2): Promise<CachedResponse<'OK'>> {
    if (input === 1) {
      throw new Error('test')
    }
    return { value: 'OK' }
  }

}
