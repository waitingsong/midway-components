import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), function () {

  const path1 = `${apiBase.decorator_error}/${apiMethod.throw_in_before}`

  it.only(`Should ${path1} work`, async () => {
    const { httpRequest } = testConfig
    const path = path1

    const resp = await httpRequest.get(path)
    assert(resp.ok, resp.text)
  })

})


