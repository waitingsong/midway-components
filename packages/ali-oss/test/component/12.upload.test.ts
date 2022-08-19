import assert from 'node:assert/strict'
import { relative } from 'node:path'

import { cloudUrlPrefix, src, testConfig } from '@/root.config'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('Should upload() work', () => {
    it('normal string', async () => {
      const { CI, ossClient } = testConfig

      const target = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`

      const ret = await ossClient.upload(src, target)
      assert(! ret.exitCode, `upload ${src} ${target} failed, ${ret.stderr}`)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')
      assert(typeof ret.data.averageSpeed === 'number')
    })
  })

})

