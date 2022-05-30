import assert from 'assert/strict'
import { relative } from 'path'

import { cloudUrlPrefix, testConfig, src } from '@/root.config'
import { Msg } from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('mv should work', () => {
    it('file', async () => {
      const { CI, ossClient } = testConfig

      const target = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      const ret = await ossClient.cp('master', src, target)
      assert(! ret.exitCode)

      const newPath = `${target}-${Date.now().toString()}`
      const mv = await ossClient.mv('master', target, newPath)
      assert(! mv.exitCode, ` ${mv.stderr}`)

      const existsDst = await ossClient.pathExists('master', newPath)
      assert(existsDst === true)

      const existsOri = await ossClient.pathExists('master', target)
      assert(existsOri === false)
    })

    it('cloud file dst already exists', async () => {
      const { CI, ossClient } = testConfig

      const target = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      const ret = await ossClient.cp('master', src, target)
      assert(! ret.exitCode)

      const dst2 = `${target}-${Date.now().toString()}`
      const cp = await ossClient.cp('master', target, dst2, { encodeSource: true })
      assert(! cp.exitCode, cp.stderr)

      const mv = await ossClient.mv('master', target, dst2)
      assert(mv.exitCode, mv.stderr)
      assert(mv.stderr.includes(Msg.cloudFileAlreadyExists))
    })

    it('link', async () => {
      const { CI, ossClient } = testConfig

      const target = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      await ossClient.cp('master', src, target)

      const link = `${target}-link`
      const ret = await ossClient.createSymlink('master', target, link)
      CI || console.log(ret)
      assert(ret.exitCode === 0)
      assert(ret.data)
      assert(typeof ret.data.elapsed === 'string')

      const exists = await ossClient.pathExists('master', link)
      assert(exists === true)

      const link2 = `${link}-${Date.now().toString()}`
      const mv = await ossClient.mv('master', link, link2)
      assert(! mv.exitCode)

      const existsDst = await ossClient.pathExists('master', link2)
      assert(existsDst === true)

      const existsOri = await ossClient.pathExists('master', link)
      assert(existsOri === false)
    })

  })
})


