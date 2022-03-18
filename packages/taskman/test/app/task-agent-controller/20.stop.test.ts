import assert from 'assert/strict'
import { relative } from 'path'

import { testConfig } from '@/root.config'
import { taskClientConfig } from '@/test.config'
import { ClientURL, TaskAgentState } from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe(`should ${ClientURL.base}/${ClientURL.stop} work`, () => {
    it('no effect with fake agentId', async () => {
      const { app, httpRequest, tm } = testConfig

      assert(tm.runningTasks.size === 0)
      assert(tm.runningTasks.size <= taskClientConfig.maxRunner)

      void httpRequest
        .get(`${ClientURL.base}/${ClientURL.start}`)
        .expect(200)
      void httpRequest
        .get(`${ClientURL.base}/${ClientURL.start}`)
        .expect(200)

      await httpRequest
        .get(`${ClientURL.base}/${ClientURL.stop}/fakeid`)
        .expect(200)

      const resp = await httpRequest
        .get(`${ClientURL.base}/${ClientURL.status}`)
        .expect(200)

      const { count } = resp.body as TaskAgentState
      assert(count === 2)
    })

    it('effect with valid agentId', async () => {
      const { httpRequest } = testConfig

      void httpRequest
        .get(`${ClientURL.base}/${ClientURL.start}`)
        .expect(200)
      void httpRequest
        .get(`${ClientURL.base}/${ClientURL.start}`)
        .expect(200)

      const resp = await httpRequest
        .get(`${ClientURL.base}/${ClientURL.status}`)
        .expect(200)
      const { agentId } = resp.body as TaskAgentState
      assert(agentId)

      const resp2 = await httpRequest
        .get(`${ClientURL.base}/${ClientURL.stop}/${agentId}`)
        .expect(200)

      const { count } = resp2.body as TaskAgentState
      assert(count === 0)
    })
  })
})

