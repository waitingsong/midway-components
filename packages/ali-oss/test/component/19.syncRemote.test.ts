import assert from 'node:assert/strict'
import { join, relative } from 'node:path'

import { assertFileExists, assertUploadFiles } from '@/helper'
import { cloudUrlPrefix, files, src, srcDir, testConfig } from '@/root.config'
import { SyncOptions } from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {
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


