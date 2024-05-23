import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), function () {

  const path = `${apiBase.route}/${apiMethod.hello}`

  it(`Should ${path}/1 work`, async () => {
    const { httpRequest } = testConfig

    const resp = await httpRequest.get(`${path}/1`)
    assert(resp.ok, resp.text)

    const ret = resp.text
    assert(ret)
    // assert(ret.startsWith('debug for'))
  })


  it(`Should ${path}/2 work`, async () => {
    const { httpRequest } = testConfig

    const resp = await httpRequest.get(`${path}/2`)
    assert(resp.ok, resp.text)

    const ret = resp.text
    assert(ret)
    // assert(ret.startsWith('debug for'))
  })
})

