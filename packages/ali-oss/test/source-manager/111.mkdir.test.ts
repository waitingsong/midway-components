import assert from 'node:assert/strict'

import type { JsonResp } from '@mwcp/share'
import { fileShortPath } from '@waiting/shared-core'

import { AliOssComponent } from '../../src/index.js'
import { cloudUrlPrefix, testConfig } from '../root.config.js'


describe(fileShortPath(import.meta.url), function() {

  const path = '/oss/mkdir'

  describe('should work', () => {
    it('normal', async () => {
      const { CI, httpRequest } = testConfig

      const target = `${cloudUrlPrefix}/1${Math.random().toString()}/`
      const resp = await httpRequest
        .post(path)
        .query({ target })
        .expect(200)

      assert(resp)
      const json = resp.body as JsonResp<Awaited<ReturnType<AliOssComponent['mkdir']>>>

      CI || console.log(json)

      assert(json.code === 0, `mkdir ${target} failed, ${json.msg}`)
      const { data } = json

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
        .expect(200)

      assert(resp)
      const json = resp.body as JsonResp<Awaited<ReturnType<AliOssComponent['mkdir']>>>

      assert(json.code === 0, `mkdir ${target} failed, ${json.msg}`)
      const { data } = json

      assert(! data.exitCode, `mkdir ${target} failed, ${data.stderr}`)
      assert(data.data)

      assert(typeof data.data.elapsed === 'string')
    })

  })
})

