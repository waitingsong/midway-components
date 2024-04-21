
import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), function () {
  describe('Should @Cacheable decorator work', () => {
    const prefix = apiBase.args

    it(apiMethod.ttl, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiMethod.ttl}`

      const resp = await httpRequest
        .get(url)

      assert(resp)
      assert(resp.ok, resp.text)
    })

    it(apiMethod.cacheName, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiMethod.cacheName}`

      const resp = await httpRequest
        .get(url)

      assert(resp)
      assert(resp.ok, resp.text)
    })

    it(apiMethod.condition, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiMethod.condition}`

      const resp = await httpRequest
        .get(url)

      assert(resp)
      assert(resp.ok, resp.text)
    })

  })
})

