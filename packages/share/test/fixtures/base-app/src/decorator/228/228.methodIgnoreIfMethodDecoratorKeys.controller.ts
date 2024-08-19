import assert from 'node:assert'

import { Controller, Get } from '@midwayjs/core'

import { apiBase, apiMethod } from '../../types/api-test.js'

import { Cacheable2 } from './221.helper.js'
import { CacheableMethodIgnoreIfMethodDecoratorKeys } from './228.helper.js'


@Controller(apiBase.methodCacheable2)
@CacheableMethodIgnoreIfMethodDecoratorKeys()
export class CacheControllerMethodIgnoreIfMethodDecoratorKeys {

  idx = 1

  @Get(`/${apiMethod.methodIgnoreIfMethodDecoratorKeys}`)
  async simple(): Promise<number> {
    const ret = await this._simpleAsync(this.idx)
    assert(ret === this.idx + 1)

    this.idx += 1

    const ret2 = this._simpleSync(this.idx)
    assert(ret2 === this.idx + 1)

    this.idx = 1
    return ret2
  }

  // #region private methods

  @Cacheable2()
  async _simpleAsync(input: number): Promise<number> {
    return input
  }

  _simpleSync(input: number): number {
    return input
  }

}

