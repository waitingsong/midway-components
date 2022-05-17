import assert from 'assert/strict'
import { relative } from 'path'

import { taskClientConfig } from '@/config.unittest'
import { testConfig } from '@/root.config'
import { ClientURL } from '~/lib/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe(`should ${ClientURL.base}/${ClientURL.hello} work`, () => {
    it('normal', async () => {
      const { httpRequest, tm } = testConfig

      assert(tm.runningTasks.size === 0)
      assert(tm.runningTasks.size <= taskClientConfig.maxRunner)

      const resp = await httpRequest
        .get(`${ClientURL.base}/${ClientURL.hello}`)
        .expect(200)

      assert(resp.text === 'OK')
      assert(tm.runningTasks.size === 0)
    })
  })
})

