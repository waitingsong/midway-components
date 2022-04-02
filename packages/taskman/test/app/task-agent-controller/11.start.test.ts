import assert from 'assert/strict'
import { relative } from 'path'

import { taskClientConfig } from '@/config.unittest'
import { testConfig } from '@/root.config'
import { ClientURL, ConfigKey, TaskAgentState, TaskClientConfig } from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe(`should ${ClientURL.base}/${ClientURL.start} work`, () => {
    it('max 1', async () => {
      const { app, httpRequest, tm } = testConfig

      assert(tm.runningTasks.size === 0)
      assert(tm.runningTasks.size <= taskClientConfig.maxRunner)

      const config: TaskClientConfig = {
        ...taskClientConfig,
        maxRunner: 1,
      }
      const globalConfig = {
        [ConfigKey.clientConfig]: config,
      }
      app.addConfigObject(globalConfig)

      const resp = await httpRequest
        .get(`${ClientURL.base}/${ClientURL.start}`)
        .expect(200)

      const { agentId, count } = resp.body as TaskAgentState
      assert(typeof agentId === 'string', agentId)
      assert(agentId.length && agentId.includes('-')) // uuid
      assert(count === 1)
    })

    it('max 2', async () => {
      const { app, httpRequest } = testConfig

      const config: TaskClientConfig = {
        ...taskClientConfig,
        maxRunner: 2,
      }
      const globalConfig = {
        [ConfigKey.clientConfig]: config,
      }
      app.addConfigObject(globalConfig)

      void httpRequest
        .get(`${ClientURL.base}/${ClientURL.start}`)
        .expect(200)
      void httpRequest
        .get(`${ClientURL.base}/${ClientURL.start}`)
        .expect(200)
      const resp = await httpRequest
        .get(`${ClientURL.base}/${ClientURL.start}`)
        .expect(200)

      const { count } = resp.body as TaskAgentState
      assert(count === config.maxRunner)
    })
  })
})

