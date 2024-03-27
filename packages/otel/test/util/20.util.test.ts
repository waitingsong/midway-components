import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { apiPrefix, apiRoute } from '#@/fixtures/base-app/src/api-route.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), function () {

  describe('should propagateHeader() work', () => {
    const path = `${apiPrefix.util}/${apiRoute.propagateHeader}`

    it('common', async () => {
      const { httpRequest } = testConfig

      const resp = await httpRequest
        .get(path)
        .expect(200)

      assert(resp.text === 'OK')
    })
  })

})

