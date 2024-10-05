
import assert from 'node:assert/strict'

import { Controller, Get } from '@midwayjs/core'

import { apiBase, apiMethod } from '../../types/api-test.js'

import { Cacheable2 } from './221.helper.js'
import { CacheableClassIgnoreIfMethodDecoratorKeys } from './226.helper.js'


@Controller(apiBase.methodCacheable2)
@CacheableClassIgnoreIfMethodDecoratorKeys()
@Cacheable2()
export class CacheControllerClassIgnoreIfMethodDecoratorKeys {

  idx = 1

  @Get(`/${apiMethod.classIgnoreIfMethodDecoratorKeys}`)
  async simple(): Promise<number> {
    this.idx = 1
    const ret = await this._simpleAsync(this.idx)
    assert(ret === this.idx + 2)

    this.idx += 1

    const ret2 = this._simpleSync(this.idx)
    assert(ret2 === this.idx + 2)

    this.idx = 1
    return ret2
  }

  // #region private methods
  async _simpleAsync(input: number): Promise<number> {
    return input
  }

  _simpleSync(input: number): number {
    return input
  }

}

