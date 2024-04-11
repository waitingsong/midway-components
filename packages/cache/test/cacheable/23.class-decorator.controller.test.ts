import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), function () {
  describe('Should @Cacheable decorator work', () => {
    const prefix = apiBase.classCacheable

    it(apiMethod.simple, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiMethod.simple}`

      const resp = await httpRequest
        .get(url)
        .expect(200)

      assert(resp)
    })

    it(apiMethod.argsOverride, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiMethod.argsOverride}`

      const resp = await httpRequest
        .get(url)
        .expect(200)

      assert(resp)
    })


    it(apiMethod.ttlFn, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiMethod.ttlFn}`

      const resp = await httpRequest
        .get(url)
        .expect(200)

      assert(resp)
    })

  })
})

