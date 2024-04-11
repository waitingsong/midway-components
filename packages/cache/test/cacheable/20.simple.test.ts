import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'

import { CacheRet } from '../decorator.helper.js'


describe(fileShortPath(import.meta.url), function () {
  describe('Should @Cacheable decorator work', () => {
    const prefix = apiBase.methodCacheable
    const url = `${prefix}/${apiMethod.simple}`

    it(url, async () => {
      const { httpRequest } = testConfig

      const resp = await httpRequest
        .get(url)
        .expect(200)

      assert(resp)
      const data = resp.body as CacheRet<string>
    })

  })
})

