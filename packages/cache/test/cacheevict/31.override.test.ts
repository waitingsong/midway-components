import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { apiPrefix, apiRoute } from '../fixtures/base-app/src/api-route.js'
import { testConfig } from '../root.config.js'


describe(fileShortPath(import.meta.url), function () {
  describe('Should @Cacheable decorator work', () => {
    const prefix = apiPrefix.classCacheable

    it(apiRoute.evictOverride, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiRoute.evictOverride}`

      const resp = await httpRequest
        .get(url)
        .expect(200)

      assert(resp)
    })

    it(apiRoute.evictCondition, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiRoute.evictCondition}`

      const resp = await httpRequest
        .get(url)
        .expect(200)

      assert(resp)
    })

    it(apiRoute.evictResult, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiRoute.evictResult}`

      const resp = await httpRequest
        .get(url)
        .expect(200)

      assert(resp)
    })

    it(apiRoute.evictResultEvenAndGreaterThanZero, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiRoute.evictResultEvenAndGreaterThanZero}`

      const resp = await httpRequest
        .get(url)
        .expect(200)

      assert(resp)
    })

    it(apiRoute.evictGenerics, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiRoute.evictGenerics}`

      const resp = await httpRequest
        .get(url)
        .expect(200)

      assert(resp)
    })

  })
})

