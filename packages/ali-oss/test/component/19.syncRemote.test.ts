import assert from 'node:assert/strict'
import { join } from 'node:path'

import { fileShortPath } from '@waiting/shared-core'

import type { SyncOptions } from '../../src/index.js'
import { assertFileExists, assertUploadFiles } from '../helper.js'
import { TestRespBody, cloudUrlPrefix, files, src, srcDir, testConfig } from '../root.config.js'


describe(fileShortPath(import.meta.url), function () {
  const target = `${cloudUrlPrefix}/sync-${Date.now().toString()}`

  describe('syncRemote should work', () => {
    it('include *.txt', async () => {
      const { CI, ossClient } = testConfig

      const opts: SyncOptions = {
        include: '*.txt',
      }
      const ret = await ossClient.syncRemote(srcDir, target, opts)
      CI || console.log(ret)
      assert(! ret.exitCode, `upload ${srcDir} ${target} failed, ${ret.stderr}`)
      assertUploadFiles(ret.data, 5, 1, 4, ret.stderr)

      for await (const file of files) {
        const d2 = join(target, file)

        if (file.endsWith('.txt')) {
          await assertFileExists(ossClient, d2)
        }
        else {
          try {
            await assertFileExists(ossClient, d2)
          }
          catch {
            continue
          }
          assert(false, `${file} should not exists`)
        }
      }
    })

    it('all', async () => {
      const { CI, ossClient } = testConfig

      const ret = await ossClient.syncRemote(srcDir, target)
      CI || console.log(ret)
      assert(! ret.exitCode, `upload ${srcDir} ${target} failed, ${ret.stderr}`)
      assertUploadFiles(ret.data, 10, 1, 9, ret.stderr)

      for await (const file of files) {
        const d2 = join(target, file)
        await assertFileExists(ossClient, d2)
      }
    })
  })
})


