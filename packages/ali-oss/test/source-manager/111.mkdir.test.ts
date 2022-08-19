import assert from 'node:assert/strict'
import { relative } from 'node:path'

import { cloudUrlPrefix, testConfig } from '@/root.config'
import { AliOssComponent, MkdirOptions } from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

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
      const ret = resp.body as Awaited<ReturnType<AliOssComponent['mkdir']>>

      CI || console.log(ret)
      assert(! ret.exitCode, `mkdir ${target} failed, ${ret.stderr}`)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')
    })

    it('mchar', async () => {
      const { CI, httpRequest } = testConfig

      const target = `${cloudUrlPrefix}/联通€-&a'b"c<d>e^f?g*-${Math.random().toString()}/v2/v3/`
      const resp = await httpRequest
        .post(path)
        .query({ target })
        .expect(200)

      assert(resp)
      const ret = resp.body as Awaited<ReturnType<AliOssComponent['mkdir']>>

      CI || console.log(ret)
      assert(! ret.exitCode, `mkdir ${target} failed, ${ret.stderr}`)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')
    })

  })
})

