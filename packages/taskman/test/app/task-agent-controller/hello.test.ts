import { relative } from 'path'

import { testConfig } from 'test/test-config'

import { agentConcurrentConfig, ServerAgent } from '~/lib/index'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe(`should ${ServerAgent.base}/${ServerAgent.hello} work`, () => {
    it('normal', async () => {
      const { httpRequest } = testConfig

      assert(agentConcurrentConfig.count === 0)
      assert(agentConcurrentConfig.count <= agentConcurrentConfig.max)

      const resp = await httpRequest
        .get(`${ServerAgent.base}/${ServerAgent.hello}`)
        .expect(200)

      assert(resp.text === 'OK')
      assert(agentConcurrentConfig.count === 0)
    })
  })
})

