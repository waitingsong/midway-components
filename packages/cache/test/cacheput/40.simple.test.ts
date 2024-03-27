import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { apiPrefix, apiRoute } from '../fixtures/base-app/src/api-route.js'
import { testConfig } from '../root.config.js'


describe(fileShortPath(import.meta.url), function () {
  describe('Should @Cacheable decorator work', () => {
    const prefix = apiPrefix.methodCachePut

    it(apiRoute.simple, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiRoute.simple}`

      const resp = await httpRequest
        .get(url)
        .expect(200)

      assert(resp)
    })

  })
})

