import assert from 'node:assert/strict'
import { stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { fileShortPath } from '@waiting/shared-core'

import { cloudUrlPrefix, src, testConfig } from '../root.config.js'


describe(fileShortPath(import.meta.url), function () {

  describe('Should download() work', () => {
    it('normal string', async () => {
      const { ossClient } = testConfig

      const target = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`

      const ret = await ossClient.upload(src, target)
      assert(! ret.exitCode, `upload ${src} ${target} failed, ${ret.stderr}`)
      assert(ret.data)

      const localFile = join(tmpdir(), `${Date.now().toString()}-tsconfig.json`)
      const down = await ossClient.download(target, localFile)
      assert(! down.exitCode, `download ${target} ${localFile} failed, ${down.stderr}`)

      const statOri = await stat(src)
      const statRet = await stat(localFile)
      assert.deepStrictEqual(statRet.size, statOri.size)
    })
  })

})

