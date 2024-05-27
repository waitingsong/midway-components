
import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), function () {
  describe('Should @Cacheable decorator work', () => {
    const prefix = apiBase.key_generator

    it(`${apiMethod.param}/:uid number`, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiMethod.param}/123`

      const resp = await httpRequest
        .get(url)
        .expect(200)

      assert(resp)
    })

    it(`${apiMethod.param}/:uid string`, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiMethod.param}/foo`

      const resp = await httpRequest
        .get(url)
        .expect(200)

      assert(resp)
    })

    it(apiMethod.query, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiMethod.query}/?uid=1&sex=male`

      const resp = await httpRequest
        .get(url)
        .expect(200)

      assert(resp)
    })
  })
})

