import assert from 'node:assert/strict'
import { relative } from 'node:path'

import { apiPrefix, apiRoute } from '@/fixtures/base-app/src/api-route'
import { testConfig } from '@/root.config'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

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

