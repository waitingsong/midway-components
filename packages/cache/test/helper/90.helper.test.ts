import assert from 'node:assert/strict'

import { CacheManager } from '@midwayjs/cache'
import { fileShortPath } from '@waiting/shared-core'

import { hashCacheKey, saveData, getData, deleteData } from '../../src/lib/helper.js'
import { testConfig } from '../root.config.js'


describe(fileShortPath(import.meta.url), function() {
  const key = 'CustService.getUserList:{"orderfield":"total","pageindex":1,"pagesize":5}'
  const expectHash = 'CustService.443bb521e2a0b756631224861f7a54f6'
  const key2 = 'CustService.getUserList'

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
      const ret = hashCacheKey(key2)
      console.log({ ret })
      assert(ret.cacheKey === key2)
      assert(! ret.cacheKeyHash)
    })

    it('save and read for long key', async () => {
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

    it('save and read for short key', async () => {
      const cacheManager = await testConfig.container.getAsync(CacheManager)
      assert(cacheManager)

      const ret = await saveData(cacheManager, key2, { a: 1 }, 30)
      console.log({ ret })
      assert(ret)
      assert(ret.CacheMetaType)
      assert(! ret.CacheMetaType.cacheKeyHash)

      const ret2 = await getData(cacheManager, key2)
      assert(ret2)
      assert(ret2.CacheMetaType)
      assert(! ret2.CacheMetaType.cacheKeyHash)

      await deleteData(cacheManager, key2)
      const ret3 = await getData(cacheManager, key2)
      assert(typeof ret3 === 'undefined')
    })

  })
})

