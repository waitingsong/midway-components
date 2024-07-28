import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), function () {
  describe('Should @Cacheable decorator work', () => {
    const prefix = apiBase.this_cacheable

    it(apiMethod.simple, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiMethod.simple}`

      const resp = await httpRequest.get(url)
      assert(resp.ok, resp.text)
    })

    it(apiMethod.method_override_class, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiMethod.method_override_class}`

      const resp = await httpRequest.get(url)
      assert(resp.ok, resp.text)
    })


    it(apiMethod.ttlFn, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiMethod.ttlFn}`

      const resp = await httpRequest.get(url)
      assert(resp.ok, resp.text)
    })

    it(apiMethod.ttl_fn2, async () => {
      const { httpRequest } = testConfig
      const url = `${prefix}/${apiMethod.ttl_fn2}`

      const resp = await httpRequest.get(url)
      assert(resp.ok, resp.text)
    })
  })
})

