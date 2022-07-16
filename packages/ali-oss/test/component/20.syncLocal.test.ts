import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { join, relative } from 'node:path'

import { assertFileExists, assertLocalFileExists, assertUploadFiles } from '@/helper'
import { cloudUrlPrefix, files, src, srcDir, testConfig, testDir } from '@/root.config'
import { ClientKey, SyncOptions } from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  const target = `${cloudUrlPrefix}/sync-${Date.now().toString()}`

  describe('syncLocal should work', () => {
    it('include *.txt', async () => {
      const { CI, ossClient } = testConfig

      await ossClient.syncRemote(ClientKey.master, srcDir, target)

      const localDir = join(testDir, 'tmp', `files-${Math.random().toString()}/`)
      await mkdir(localDir, { recursive: true })
      const opts: SyncOptions = {
        include: '*.txt',
      }
      const ret = await ossClient.syncLocal(ClientKey.master, target, localDir, opts)
      CI || console.log(ret)

      for await (const file of files) {
        const d2 = join(localDir, file)

        if (file.endsWith('.txt')) {
          await assertLocalFileExists(d2)
        }
        else {
          try {
            await assertLocalFileExists(d2)
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

      await ossClient.syncRemote(ClientKey.master, srcDir, target)

      const localDir = join(testDir, 'tmp', `files-${Math.random().toString()}/`)
      await mkdir(localDir, { recursive: true })
      const ret = await ossClient.syncLocal(ClientKey.master, target, localDir)
      CI || console.log(ret)

      for await (const file of files) {
        const d2 = join(localDir, file)
        await assertLocalFileExists(d2)
      }
    })
  })
})

