import assert from 'assert/strict'
import { relative } from 'path'

import { testConfig } from '@/root.config'
import { taskClientConfig } from '@/test.config'
import { ClientURL } from '~/lib/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe(`should ${ClientURL.base}/${ClientURL.start} work`, () => {
    it('max 1', async () => {
      const { httpRequest, tm } = testConfig

      assert(tm.runningTasks.size === 0)
      assert(tm.runningTasks.size <= taskClientConfig.maxRunner)

      const resp = await httpRequest
        .get(`${ClientURL.base}/${ClientURL.start}`)
        .expect(200)

      const agentId = resp.body as string
      assert(typeof agentId === 'string')
      assert(agentId.length)
    })

    // it('max 2', async () => {
    //   const { httpRequest } = testConfig

    //   initTaskAgentConfig.maxRunning = 2

    //   const resp = await httpRequest
    //     .get(`${ClientURL.base}/${ClientURL.startOne}`)
    //     .expect(200)

    //   const ret = resp.body as TaskAgentState
    //   assert(ret.count <= ret.maxRunning)
    //   assert(ret.count === 2)
    //   assert(ret.startedAgentId.length)
    // })

    // it('max limit', async () => {
    //   const { httpRequest } = testConfig

    //   initTaskAgentConfig.maxRunning = 2

    //   assert(taskAgentSubscriptionMap.size === 2)
    //   assert(taskAgentSubscriptionMap.size <= initTaskAgentConfig.maxRunning)

    //   const resp = await httpRequest
    //     .get(`${ClientURL.base}/${ClientURL.startOne}`)
    //     .expect(200)

    //   const ret = resp.body as TaskAgentState
    //   assert(ret.count <= ret.maxRunning)
    //   assert(ret.count === 2)

    //   const resp2 = await httpRequest
    //     .get(`${ClientURL.base}/${ClientURL.startOne}`)
    //     .expect(200)

    //   const ret2 = resp2.body as TaskAgentState
    //   assert(ret2.count === 2)
    //   assert(! ret.startedAgentId.length)
    // })
  })
})

