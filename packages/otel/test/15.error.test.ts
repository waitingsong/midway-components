import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), function () {

  const path = `${apiBase.TraceDecorator}/${apiMethod.error}` // exception will be caught
  const pathTrace = `${apiBase.TraceDecorator}/${apiMethod.trace_error}`

  it(`Should ${path} work`, async () => {
    const { httpRequest } = testConfig

    const resp = await httpRequest.get(path)
    assert(resp.ok, resp.text)

    const ret = resp.text
    assert(ret.startsWith('debug for'))
    assert(ret.includes('error'))
  })

  // error from default.service will be traced
  it(`Should ${pathTrace} work`, async () => {
    const { httpRequest } = testConfig

    const resp = await httpRequest.get(pathTrace)
    assert(! resp.ok, resp.text)
    assert(resp.status === 500, resp.text)

    const ret = resp.text
    // assert(! ret, ret)
    assert(ret.includes('debug for DefaultComponentService.error()'), ret)
  })

})

