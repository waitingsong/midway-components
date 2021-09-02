import { relative } from 'path'

import { testConfig } from 'test/root.config'

import { taskAgentSubscriptionMap } from '~/lib/data'
import {
  ServerAgent,
  initTaskAgentConfig,
  TaskAgentState,
} from '~/lib/index'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe(`should ${ServerAgent.base}/${ServerAgent.startOne} work`, () => {
    it('max 1', async () => {
      const { httpRequest } = testConfig

      assert(taskAgentSubscriptionMap.size === 0)
      assert(taskAgentSubscriptionMap.size <= initTaskAgentConfig.maxRunning)

      const resp = await httpRequest
        .get(`${ServerAgent.base}/${ServerAgent.startOne}`)
        .expect(200)

      const ret = resp.body as TaskAgentState
      assert(ret.count <= ret.maxRunning)
      assert(ret.count === 1)
      assert(ret.startedAgentId.length)
    })

    it('max 2', async () => {
      const { httpRequest } = testConfig

      initTaskAgentConfig.maxRunning = 2

      assert(taskAgentSubscriptionMap.size === 1)
      assert(taskAgentSubscriptionMap.size <= initTaskAgentConfig.maxRunning)

      const resp = await httpRequest
        .get(`${ServerAgent.base}/${ServerAgent.startOne}`)
        .expect(200)

      const ret = resp.body as TaskAgentState
      assert(ret.count <= ret.maxRunning)
      assert(ret.count === 2)
      assert(ret.startedAgentId.length)
    })

    it('max limit', async () => {
      const { httpRequest } = testConfig

      initTaskAgentConfig.maxRunning = 2

      assert(taskAgentSubscriptionMap.size === 2)
      assert(taskAgentSubscriptionMap.size <= initTaskAgentConfig.maxRunning)

      const resp = await httpRequest
        .get(`${ServerAgent.base}/${ServerAgent.startOne}`)
        .expect(200)

      const ret = resp.body as TaskAgentState
      assert(ret.count <= ret.maxRunning)
      assert(ret.count === 2)

      const resp2 = await httpRequest
        .get(`${ServerAgent.base}/${ServerAgent.startOne}`)
        .expect(200)

      const ret2 = resp2.body as TaskAgentState
      assert(ret2.count === 2)
      assert(! ret.startedAgentId.length)
    })
  })
})

