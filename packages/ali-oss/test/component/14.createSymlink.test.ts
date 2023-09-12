import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { cloudUrlPrefix, src, testConfig, TestRespBody } from '../root.config.js'


describe(fileShortPath(import.meta.url), function() {
  describe('createSymlink should work', () => {
    it('normal', async () => {
      const { CI, ossClient } = testConfig

      const target = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      await ossClient.cp(src, target)

      const link = `${target}-link`
      const ret = await ossClient.createSymlink(target, link)
      CI || console.log(ret)
      assert(ret.exitCode === 0)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')
    })
  })

})


