import assert from 'node:assert/strict'
import { relative } from 'node:path'

import { cloudUrlPrefix, testConfig, src } from '@/root.config'
import { SignOptions } from '~/lib/types'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('sign should work', () => {
    it('normal', async () => {
      const { CI, ossClient } = testConfig

      const target = `${cloudUrlPrefix}/${Date.now().toString()}-tsconfig.json`
      const ret = await ossClient.cp(src, target)
      CI || console.log(ret)
      assert(! ret.exitCode, `cp ${src} ${target} failed, ${ret.stderr}`)
      assert(ret.data)

      const sign = await ossClient.sign(target, { disableEncodeSlash: true })
      assert(! sign.exitCode, `sign ${target} failed, ${sign.stderr}`)
      assert(sign.data)

      const { data } = sign
      assert(data.httpUrl)
      assert(data.httpUrl.startsWith('https://'))
      assert(! data.httpUrl.includes('?Expires='))
      assert(! data.httpUrl.includes('AccessKeyId='))

      assert(data.httpShareUrl)
      assert(data.httpShareUrl.startsWith('https://'))
      assert(data.httpShareUrl.includes('?Expires='))
      assert(data.httpShareUrl.includes('AccessKeyId='))

      assert(data.link)
      assert(data.link.startsWith('https://'))
      assert(! data.link.includes('?Expires='))
      assert(! data.link.includes('AccessKeyId='))
      assert(! data.link.includes('%2F'))
    })

    it('param trafic-limit (typo)', async () => {
      const { CI, ossClient } = testConfig

      const target = `${cloudUrlPrefix}/${Date.now().toString()}-config.js`
      const ret = await ossClient.cp(src, target)
      CI || console.log(ret)
      assert(! ret.exitCode, `cp ${src} ${target} failed, ${ret.stderr}`)
      assert(ret.data)

      const opts2: SignOptions = {
        trafficLimit: 245760,
        timeoutSec: 360,
      }
      const sign = await ossClient.sign(src, opts2)
      assert(! sign.exitCode, `sign ${target} failed, ${sign.stderr}`)
      assert(sign.data)

      const { data } = sign
      assert(data.httpShareUrl)
    })

  })
})


