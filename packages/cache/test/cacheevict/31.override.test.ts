import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), function () {
  describe('Should @Cacheable decorator work', () => {
    const prefix = apiBase.class_cacheable

    it(apiMethod.evict_override, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiMethod.evict_override}`

      const resp = await httpRequest.get(url)
      assert(resp.ok, resp.text)
    })

    it(apiMethod.evict_condition, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiMethod.evict_condition}`

      const resp = await httpRequest.get(url)
      assert(resp.ok, resp.text)
    })

    it(apiMethod.evict_result, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiMethod.evict_result}`

      const resp = await httpRequest.get(url)
      assert(resp.ok, resp.text)
    })

    it(apiMethod.evict_result_even_and_greater_than_zero, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiMethod.evict_result_even_and_greater_than_zero}`

      const resp = await httpRequest.get(url)
      assert(resp.ok, resp.text)
    })

    it(apiMethod.evict_generics, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiMethod.evict_generics}`

      const resp = await httpRequest.get(url)
      assert(resp.ok, resp.text)
    })

  })
})

