import assert from 'node:assert/strict'
import { relative } from 'node:path'

import { cloudUrlPrefix, src, testConfig } from '@/root.config'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

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

