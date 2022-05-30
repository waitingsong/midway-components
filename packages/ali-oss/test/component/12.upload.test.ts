import assert from 'assert/strict'
import { relative } from 'path'

import { cloudUrlPrefix, src, testConfig } from '@/root.config'
import { ClientKey } from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')


describe(filename, () => {

  describe('Should upload() work', () => {
    it('normal string', async () => {
      const { CI, ossClient } = testConfig

      const target = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`

      const ret = await ossClient.upload(ClientKey.master, src, target)
      assert(! ret.exitCode, `upload ${src} ${target} failed, ${ret.stderr}`)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')
      assert(typeof ret.data.averageSpeed === 'number')
    })
  })

})

