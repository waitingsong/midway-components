import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { truncateString } from '##/lib/util.js'
import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), function () {

  describe('should propagateHeader() work', () => {
    const path = `${apiBase.util}/${apiMethod.propagateHeader}`

    it('common', async () => {
      const { httpRequest } = testConfig

      const resp = await httpRequest
        .get(path)

      assert(resp.ok, resp.text)
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

