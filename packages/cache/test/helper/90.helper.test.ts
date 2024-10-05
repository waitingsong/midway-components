import assert from 'node:assert/strict'

import { CachingFactory } from '@midwayjs/cache-manager'
import { fileShortPath } from '@waiting/shared-core'

import { deleteData, getData, hashCacheKey, saveData } from '##/lib/helper.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), function () {
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
      const cachingFactory = await testConfig.container.getAsync(CachingFactory)
      assert(cachingFactory)
      const caching = cachingFactory.get('default')

      const ret = await saveData(caching, key, { a: 1 }, 30)
      console.log({ ret })
      assert(ret)
      assert(ret.CacheMetaType)
      assert(ret.CacheMetaType.cacheKeyHash === expectHash)

      const ret2 = await getData(caching, key)
      assert(ret2)
      assert(ret2.CacheMetaType)
      assert(ret2.CacheMetaType.cacheKeyHash === expectHash)

      await deleteData(caching, key)
      const ret3 = await getData(caching, key)
      assert(typeof ret3 === 'undefined')
    })

    it('save and read for short key', async () => {
      const cachingFactory = await testConfig.container.getAsync(CachingFactory)
      assert(cachingFactory)
      const caching = cachingFactory.get('default')

      const ret = await saveData(caching, key2, { a: 1 }, 30)
      console.log({ ret })
      assert(ret)
      assert(ret.CacheMetaType)
      assert(! ret.CacheMetaType.cacheKeyHash)

      const ret2 = await getData(caching, key2)
      assert(ret2)
      assert(ret2.CacheMetaType)
      assert(! ret2.CacheMetaType.cacheKeyHash)

      await deleteData(caching, key2)
      const ret3 = await getData(caching, key2)
      assert(typeof ret3 === 'undefined')
    })

  })
})

