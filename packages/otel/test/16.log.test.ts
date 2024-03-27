import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { apiPrefix, apiRoute } from '#@/fixtures/base-app/src/api-route.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), function () {

  const pathLog = `${apiPrefix.TraceDecorator}/${apiRoute.log}` // exception will be caught
  const pathAppLog = `${apiPrefix.TraceDecorator}/${apiRoute.appLog}`

  it(`Should ${pathLog} work`, async () => {
    const { httpRequest } = testConfig

    const resp = await httpRequest
      .get(pathLog)
      .expect(200)

    const ret = resp.text
    assert(ret)
    // assert(ret.startsWith('debug for'))
  })

  it(`Should ${pathAppLog} work`, async () => {
    const { httpRequest } = testConfig

    const resp = await httpRequest
      .get(pathAppLog)
      .expect(200)

    const ret = resp.text
    assert(ret)
    // assert(! ret, ret)
    // assert(ret.includes('debug for DefaultComponentService.error()'), ret)
  })

})

