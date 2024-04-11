import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), function () {
  describe('Should @Cacheable decorator work', () => {
    const prefix = apiBase.classCacheable

    it(apiMethod.evictOverride, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiMethod.evictOverride}`

      const resp = await httpRequest
        .get(url)
        .expect(200)

      assert(resp)
    })

    it(apiMethod.evictCondition, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiMethod.evictCondition}`

      const resp = await httpRequest
        .get(url)
        .expect(200)

      assert(resp)
    })

    it(apiMethod.evictResult, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiMethod.evictResult}`

      const resp = await httpRequest
        .get(url)
        .expect(200)

      assert(resp)
    })

    it(apiMethod.evictResultEvenAndGreaterThanZero, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiMethod.evictResultEvenAndGreaterThanZero}`

      const resp = await httpRequest
        .get(url)
        .expect(200)

      assert(resp)
    })

    it(apiMethod.evictGenerics, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiMethod.evictGenerics}`

      const resp = await httpRequest
        .get(url)
        .expect(200)

      assert(resp)
    })

  })
})

