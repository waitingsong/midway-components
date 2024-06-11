import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), function () {

  const path1 = `${apiBase.decorator_singleton}/${apiMethod.hello}`
  const path2 = `${apiBase.decorator_singleton}/${apiMethod.home}`

  it(`Should ${path1} work`, async () => {
    const { httpRequest } = testConfig
    const path = path1

    const resp = await httpRequest.get(path)
    assert(resp.ok, resp.text)
  })

  it(`Should ${path2} work`, async () => {
    const { httpRequest } = testConfig
    const path = path2

    const resp = await httpRequest.get(path)
    assert(resp.ok, resp.text)
  })

})


