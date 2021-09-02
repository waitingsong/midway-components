import { relative } from 'path'

import { testConfig } from 'test/test-config'

import {
  ServerAgent,
  agentConcurrentConfig,
  AgentConcurrentConfig,
} from '~/lib/index'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe(`should ${ServerAgent.base}/${ServerAgent.start} work`, () => {
    it('max 1', async () => {
      const { httpRequest } = testConfig

      assert(agentConcurrentConfig.count === 0)
      assert(agentConcurrentConfig.count <= agentConcurrentConfig.max)

      const resp = await httpRequest
        .get(`${ServerAgent.base}/${ServerAgent.start}`)
        .expect(200)

      const ret = resp.body as AgentConcurrentConfig
      assert(ret.count <= ret.count)
      assert(ret.count === 1)
    })

    it('max 2', async () => {
      const { httpRequest } = testConfig

      agentConcurrentConfig.max = 2

      assert(agentConcurrentConfig.count === 1)
      assert(agentConcurrentConfig.count <= agentConcurrentConfig.max)

      const resp = await httpRequest
        .get(`${ServerAgent.base}/${ServerAgent.start}`)
        .expect(200)

      const ret = resp.body as AgentConcurrentConfig
      assert(ret.count <= ret.count)
      assert(ret.count === 2)
    })

    it('max limit', async () => {
      const { httpRequest } = testConfig

      agentConcurrentConfig.max = 2

      assert(agentConcurrentConfig.count === 2)
      assert(agentConcurrentConfig.count <= agentConcurrentConfig.max)

      const resp = await httpRequest
        .get(`${ServerAgent.base}/${ServerAgent.start}`)
        .expect(200)

      const ret = resp.body as AgentConcurrentConfig
      assert(ret.count <= ret.count)
      assert(ret.count === 2)

      const resp2 = await httpRequest
        .get(`${ServerAgent.base}/${ServerAgent.start}`)
        .expect(200)

      const ret2 = resp2.body as AgentConcurrentConfig
      assert(ret2.count === 2)
    })
  })
})

