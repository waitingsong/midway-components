import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), function () {


  const path = `${apiBase.TraceDecorator}/${apiMethod.error}` // exception will be caught
  const pathTrace = `${apiBase.TraceDecorator}/${apiMethod.trace_error}`

  it(`Should ${path} work`, async () => {
    const { httpRequest } = testConfig

    const resp = await httpRequest
      .get(path)
      .expect(200)

    const ret = resp.text
    assert(ret.startsWith('debug for'))
  })

  // error from default.service will be traced
  it(`Should ${pathTrace} work`, async () => {
    const { httpRequest } = testConfig

    const resp = await httpRequest
      .get(pathTrace)
      .expect(500)

    const ret = resp.text
    // assert(! ret, ret)
    assert(ret.includes('debug for DefaultComponentService.error()'), ret)
  })

})

