import assert from 'node:assert/strict'
import { relative } from 'node:path'

import { apiPrefix, apiRoute } from '@/fixtures/base-app/src/api-route'
import { testConfig, TestRespBody } from '@/root.config'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  const pathLog = `${apiPrefix.TraceDecorator}/${apiRoute.log}` // exception will be caught
  const pathAppLog = `${apiPrefix.TraceDecorator}/${apiRoute.appLog}`

  it(`Should ${pathLog} work`, async () => {
    const { httpRequest } = testConfig

    const resp = await httpRequest
      .get(pathLog)
      .expect(200)

    const ret = resp.text as string
    assert(ret)
    // assert(ret.startsWith('debug for'))
  })

  it(`Should ${pathAppLog} work`, async () => {
    const { httpRequest } = testConfig

    const resp = await httpRequest
      .get(pathAppLog)
      .expect(200)

    const ret = resp.text as string
    assert(ret)
    // assert(! ret, ret)
    // assert(ret.includes('debug for DefaultComponentService.error()'), ret)
  })

})

