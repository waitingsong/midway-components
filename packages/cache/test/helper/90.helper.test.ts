import assert from 'node:assert/strict'
import { relative } from 'node:path'

import { hashCacheKey } from '~/lib/helper'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {
  describe('Should hashCacheKey() work', () => {
    it('common', async () => {
      const key = 'CustService.getUserList:{"orderfield":"total","pageindex":1,"pagesize":5}'
      const ret = hashCacheKey(key)
      console.log({ ret })
      assert(ret.cacheKey === key)
      assert(ret.cacheKeyHash)
      assert(ret.cacheKeyHash.length > 0)
      assert(ret.cacheKeyHash.length <= 48)
    })

    it('no hash', async () => {
      const key = 'CustService.getUserList'
      const ret = hashCacheKey(key)
      console.log({ ret })
      assert(ret.cacheKey === key)
      assert(! ret.cacheKeyHash)
    })
  })
})

