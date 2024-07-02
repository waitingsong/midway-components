import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { apiBase, apiMethod } from '#@/api-test.js'

import type { AliOssComponent } from '../../src/index.js'
import { cloudUrlPrefix, src, testConfig } from '../root.config.js'


describe(fileShortPath(import.meta.url), function () {
  describe('should work', () => {
    it('stat', async () => {
      const { CI, httpRequest } = testConfig

      const path = `${apiBase.oss}/${apiMethod.mkdir}`
      const target = `${cloudUrlPrefix}/联通€-&a'b"c<d>e^f?g*-${Math.random().toString()}/v2/v3/`
      const resp = await httpRequest
        .post(path)
        .query({ target })

      assert(resp.ok, resp.text)
      const ret = resp.body as Awaited<ReturnType<AliOssComponent['mkdir']>>

      CI || console.log(ret)
      assert(! ret.exitCode, `mkdir ${target} failed, ${ret.stderr}`)
      assert(ret.data)
      // @FIXME
      // assert(typeof ret.data.elapsed === 'string')

      const path2 = `${apiBase.oss}/${apiMethod.stat}`
      const resp2 = await httpRequest
        .get(path2)
        .query({ target })

      assert(resp2.ok, resp2.text)
      const ret2 = resp2.body as Awaited<ReturnType<AliOssComponent['stat']>>
      CI || console.log(ret2)
      assert(! ret2.exitCode, `stat ${target} failed, ${ret2.stderr}`)
      assert(ret2)
    })

  })
})

