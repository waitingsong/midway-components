import assert from 'node:assert/strict'
import { relative } from 'node:path'

import { CacheManager } from '@midwayjs/cache'

import { testConfig } from '@/root.config'
import { hashCacheKey, saveData, getData, deleteData } from '~/lib/helper'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {
  const key = 'CustService.getUserList:{"orderfield":"total","pageindex":1,"pagesize":5}'
  const expectHash = 'CustService.443bb521e2a0b756631224861f7a54f6'

  describe('Should hashCacheKey() work', () => {
    it('common', async () => {
      const ret = hashCacheKey(key)
      console.log({ ret })
      assert(ret.cacheKey === key)
      assert(ret.cacheKeyHash)
      assert(ret.cacheKeyHash.length > 0)
      assert(ret.cacheKeyHash.length <= 48)
      assert(ret.cacheKeyHash === expectHash)
    })

    it('no hash', async () => {
      const key2 = 'CustService.getUserList'
      const ret = hashCacheKey(key2)
      console.log({ ret })
      assert(ret.cacheKey === key2)
      assert(! ret.cacheKeyHash)
    })

    it('save and read', async () => {
      const cacheManager = await testConfig.container.getAsync(CacheManager)
      assert(cacheManager)

      const ret = await saveData(cacheManager, key, { a: 1 }, 30)
      console.log({ ret })
      assert(ret)
      assert(ret.CacheMetaType)
      assert(ret.CacheMetaType.cacheKeyHash === expectHash)

      const ret2 = await getData(cacheManager, key)
      assert(ret2)
      assert(ret2.CacheMetaType)
      assert(ret2.CacheMetaType.cacheKeyHash === expectHash)

      await deleteData(cacheManager, key)
      const ret3 = await getData(cacheManager, key)
      assert(typeof ret3 === 'undefined')
    })

  })
})

