import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { apiBase, apiMethod } from '#@/api-test.js'

import type { AliOssComponent } from '../../src/index.js'
import { cloudUrlPrefix, testConfig } from '../root.config.js'


describe(fileShortPath(import.meta.url), function () {

  const path = `${apiBase.oss}/${apiMethod.mkdir}`

  describe('should work', () => {
    it('normal', async () => {
      const { CI, httpRequest } = testConfig

      const target = `${cloudUrlPrefix}/1${Math.random().toString()}/`
      const resp = await httpRequest
        .post(path)
        .query({ target })

      assert(resp.ok, resp.text)
      const data = resp.body as Awaited<ReturnType<AliOssComponent['mkdir']>>

      CI || console.log(data)

      assert(! data.exitCode, `mkdir ${target} failed, ${data.stderr}`)
      assert(data.data)
      assert(typeof data.data.elapsed === 'string', JSON.stringify(data.data))
    })

    it('mchar', async () => {
      const { CI, httpRequest } = testConfig

      const target = `${cloudUrlPrefix}/联通€-&a'b"c<d>e^f?g*-${Math.random().toString()}/v2/v3/`
      const resp = await httpRequest
        .post(path)
        .query({ target })

      assert(resp.ok, resp.text)
      const data = resp.body as Awaited<ReturnType<AliOssComponent['mkdir']>>

      assert(! data.exitCode, `mkdir ${target} failed, ${data.stderr}`)
      assert(data.data)

      assert(typeof data.data.elapsed === 'string')
    })

  })
})

