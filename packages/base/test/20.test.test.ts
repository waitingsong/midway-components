import assert from 'node:assert/strict'
import { relative } from 'node:path'

import { testConfig, TestRespBody } from '@/root.config'
import { ErrorCode, JsonResp } from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  it('Should work', async () => {
    const { httpRequest, app } = testConfig

    const path = '/test/err'
    const resp = await httpRequest
      .get(path)
      .expect(200)

    const ret = resp.body as JsonResp
    assert(ret.code === 2404)
    assert(ret.codeKey === ErrorCode[ret.code])

    const globalErrorCode = app.getConfig('globalErrorCode') as Record<string | number, string | number>
    assert.deepStrictEqual(globalErrorCode, ErrorCode)
    assert(ret.codeKey === globalErrorCode[ret.code])
  })

})

