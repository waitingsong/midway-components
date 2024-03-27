import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { MkdirOptions } from '../../src/index.js'
import { cloudUrlPrefix, testConfig, TestRespBody } from '../root.config.js'


describe(fileShortPath(import.meta.url), function () {

  describe('mkdir should work', () => {
    it('normal', async () => {
      const { CI, ossClient } = testConfig

      const target = `${cloudUrlPrefix}/1${Math.random().toString()}/`
      const ret = await ossClient.mkdir(target)

      CI || console.log(ret)
      assert(! ret.exitCode, `mkdir ${target} failed, ${ret.stderr}`)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')
    })

    it('mchar', async () => {
      const { CI, ossClient } = testConfig

      const target = `${cloudUrlPrefix}/联通€-&a'b"c<d>e^f?g*-${Math.random().toString()}/v2/v3/`
      const ret = await ossClient.mkdir(target)

      CI || console.log(ret)
      assert(! ret.exitCode, `mkdir ${target} failed, ${ret.stderr}`)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')
    })

    it('incorrect dir name when encodeTarget:false', async () => {
      const { CI, ossClient } = testConfig

      const prefix = `${cloudUrlPrefix}/联通€-`
      const target = `${prefix}&a'b"c<d>e?f*-${Math.random().toString()}/v2/v3/`

      const opts: MkdirOptions = {
        encodeTarget: false,
      }

      try {
        const ret = await ossClient.mkdir(target, opts)
        CI || console.log(ret)
        assert(! ret.exitCode, `mkdir ${target} failed, ${ret.stderr}`)
        assert(ret.data)
      }
      catch (ex) {
        assert(ex instanceof Error, 'ex is Error')
        return
      }
      assert(false, 'should throw err but not')
    })
  })
})

