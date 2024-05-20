import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { getRouterInfo } from '##/index.js'
import { apiBase, apiMethod } from '#@/api-test.js'
import { RespData, TestRespBody, testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), () => {

  const hello = `${apiBase.router}/${apiMethod.hello}`
  const path1 = `${hello}/123`
  const path2 = `${hello}/456`
  const expect = `${apiBase.router}/${apiMethod.helloId}`

  describe('Should getRouterInfo() work', () => {
    it(path1, async () => {
      const { httpRequest } = testConfig

      const resp = await httpRequest.get(path1)
      assert(resp.ok, resp.text)
      const ret = resp.body as Awaited<ReturnType<typeof getRouterInfo>>
      assert(ret)
      assert(ret.id)
      assert(ret.fullUrl === expect)
    })

    it(path2, async () => {
      const { httpRequest } = testConfig

      const resp = await httpRequest.get(path2)
      assert(resp.ok, resp.text)
      const ret = resp.body as Awaited<ReturnType<typeof getRouterInfo>>
      assert(ret)
      assert(ret.id)
      assert(ret.fullUrl === expect)
    })

  })

})

