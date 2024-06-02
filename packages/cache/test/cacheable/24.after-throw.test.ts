import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), function () {
  describe('Should @Cacheable decorator work', () => {
    const prefix = apiBase.method_cacheable
    const url = `${prefix}/${apiMethod.after_throw}`

    it(url, async () => {
      const { httpRequest } = testConfig

      const resp = await httpRequest.get(url)
      assert(resp.ok, resp.text)
      assert(resp.text === 'OK')
    })

  })
})

