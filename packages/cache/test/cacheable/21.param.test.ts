import assert from 'node:assert/strict'
import { relative } from 'node:path'

import { apiPrefix, apiRoute } from '@/fixtures/base-app/src/api-route'
import { testConfig } from '@/root.config'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {
  describe('Should @Cacheable decorator work', () => {
    const prefix = apiPrefix.keyGenerator

    it(`${apiRoute.param}/:uid number`, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiRoute.param}/123`

      const resp = await httpRequest
        .get(url)
        .expect(200)

      assert(resp)
    })

    it(`${apiRoute.param}/:uid string`, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiRoute.param}/foo`

      const resp = await httpRequest
        .get(url)
        .expect(200)

      assert(resp)
    })

    it(apiRoute.query, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiRoute.query}/?uid=1&sex=male`

      const resp = await httpRequest
        .get(url)
        .expect(200)

      assert(resp)
    })
  })
})

