import assert from 'node:assert/strict'
import { relative } from 'node:path'

import { testConfig, TestRespBody } from '@/root.config'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  const path = '/_otel/error'
  const pathTrace = '/_otel/trace_error'

  it(`Should ${path} work`, async () => {
    const { httpRequest } = testConfig

    const resp = await httpRequest
      .get(path)
      .expect(200)

    const ret = resp.text as string
    assert(ret.startsWith('debug for'))
  })

  // error from default.servcie will be traced
  it(`Should ${pathTrace} work`, async () => {
    const { httpRequest } = testConfig

    const resp = await httpRequest
      .get(pathTrace)
      .expect(204)

    const ret = resp.text as string
    assert(! ret)
    // assert(ret.startsWith('debug for'))
  })

})

