import assert from 'node:assert/strict'
import { relative } from 'node:path'

import { CacheRet } from '../decorator.helper'

import { apiPrefix, apiRoute } from '@/fixtures/base-app/src/api-route'
import { testConfig } from '@/root.config'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {
  describe('Should @Cacheable decorator work', () => {
    const prefix = apiPrefix.methodCacheEvict

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

