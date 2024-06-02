import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), function () {
  describe('Should @CacheEvict decorator work', () => {
    const prefix = apiBase.method_cacheevict

    it(apiMethod.param, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiMethod.param}`

      const resp = await httpRequest.get(url)
      assert(resp.ok, resp.text)
    })

    it(apiMethod.param_array, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiMethod.param_array}`

      const resp = await httpRequest.get(url)
      assert(resp.ok, resp.text)
    })

    it(apiMethod.param_mix, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiMethod.param_mix}`

      const resp = await httpRequest.get(url)
      assert(resp.ok, resp.text)
    })
  })
})

