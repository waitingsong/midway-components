import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { cloudUrlPrefix, src, testConfig } from '../root.config.js'


describe(fileShortPath(import.meta.url), function() {

  describe('rm should work', () => {
    it('normal', async () => {
      const { CI, ossClient } = testConfig

      const target = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      await ossClient.upload(src, target)

      const ret = await ossClient.rm(target)
      CI || console.log(ret)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')
    })
  })
})

