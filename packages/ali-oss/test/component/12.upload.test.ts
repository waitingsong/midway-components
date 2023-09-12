import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { cloudUrlPrefix, src, testConfig, TestRespBody } from '../root.config.js'


describe(fileShortPath(import.meta.url), function() {

  describe('Should upload() work', () => {
    it('normal string', async () => {
      const { ossClient } = testConfig

      const target = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`

      const ret = await ossClient.upload(src, target)
      assert(! ret.exitCode, `upload ${src} ${target} failed, ${ret.stderr}`)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')
      assert(typeof ret.data.averageSpeed === 'number')
    })
  })

})

