import assert from 'node:assert/strict'
import { relative } from 'node:path'

import { cloudUrlPrefix, testConfig, src } from '@/root.config'
import { Msg } from '~/lib/types'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('mv should work', () => {
    it('file', async () => {
      const { CI, ossClient } = testConfig

      const target = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      const ret = await ossClient.cp(src, target)
      assert(! ret.exitCode)

      const newPath = `${target}-${Date.now().toString()}`
      const mv = await ossClient.mv(target, newPath)
      assert(! mv.exitCode, ` ${mv.stderr}`)

      const existsDst = await ossClient.pathExists(newPath)
      assert(existsDst === true)

      const existsOri = await ossClient.pathExists(target)
      assert(existsOri === false)
    })

    it('cloud file dst already exists', async () => {
      const { CI, ossClient } = testConfig

      const target = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      const ret = await ossClient.cp(src, target)
      assert(! ret.exitCode)

      const dst2 = `${target}-${Date.now().toString()}`
      const cp = await ossClient.cp(target, dst2, { encodeSource: true })
      assert(! cp.exitCode, cp.stderr)

      const mv = await ossClient.mv(target, dst2)
      assert(mv.exitCode, mv.stderr)
      assert(mv.stderr.includes(Msg.cloudFileAlreadyExists))
    })

    it('link', async () => {
      const { CI, ossClient } = testConfig

      const target = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      await ossClient.cp(src, target)

      const link = `${target}-link`
      const ret = await ossClient.createSymlink(target, link)
      CI || console.log(ret)
      assert(ret.exitCode === 0)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')

      const exists = await ossClient.pathExists(link)
      assert(exists === true)

      const link2 = `${link}-${Date.now().toString()}`
      const mv = await ossClient.mv(link, link2)
      assert(! mv.exitCode)

      const existsDst = await ossClient.pathExists(link2)
      assert(existsDst === true)

      const existsOri = await ossClient.pathExists(link)
      assert(existsOri === false)
    })

  })
})


