import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { truncateString } from '##/lib/util.js'
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

  describe('should truncateString() work', () => {
    const str = 'abcdefg'

    it('common', async () => {
      const ret = truncateString(str)
      assert(ret === str)
    })

    it('common', async () => {
      const ret = truncateString(str, 1)
      assert(ret === 'a... LENGTH: 7 bytes')
    })
  })

})

