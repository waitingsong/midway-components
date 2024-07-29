import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), function () {

  const path = `${apiBase.decorator_error}/${apiMethod.throw_in_after}`

  it(`Should ${path} work`, async () => {
    const { httpRequest } = testConfig

    const resp = await httpRequest.get(path)
    assert(resp.ok, resp.text)
  })

})


