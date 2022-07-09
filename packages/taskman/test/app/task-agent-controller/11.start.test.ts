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

      const currConfig = app.getConfig(ConfigKey.clientConfig) as TaskClientConfig
      console.log({ currConfig })

      const config: TaskClientConfig = {
        ...taskClientConfig,
        maxRunner: 1,
      }
      const globalConfig = {
        [ConfigKey.clientConfig]: config,
      }
      app.addConfigObject(globalConfig)

      const currConfig1a = app.getConfig(ConfigKey.clientConfig) as TaskClientConfig
      console.log({ currConfig2: currConfig1a })

      const resp = await httpRequest
        .get(`${ClientURL.base}/${ClientURL.start}`)
        .expect(200)

      const { agentId, count } = resp.body as TaskAgentState
      assert(typeof agentId === 'string', agentId)
      assert(agentId.length && agentId.includes('-')) // uuid

      const nowConfig = app.getConfig(ConfigKey.clientConfig) as TaskClientConfig
      console.log({ nowConfig })

      assert(count === 1, `count: ${count}, config: ${config.maxRunner}`)
    })

    it('max 2', async () => {
      const { app, httpRequest } = testConfig

      const currConfig = app.getConfig(ConfigKey.clientConfig) as TaskClientConfig
      console.log({ currConfig2: currConfig })

      const config: TaskClientConfig = {
        ...taskClientConfig,
        maxRunner: 2,
      }
      const globalConfig = {
        [ConfigKey.clientConfig]: config,
      }
      app.addConfigObject(globalConfig)

      const currConfig2a = app.getConfig(ConfigKey.clientConfig) as TaskClientConfig
      console.log({ currConfig2a })

      void httpRequest
        .get(`${ClientURL.base}/${ClientURL.start}`)
        .expect(200)
      void httpRequest
        .get(`${ClientURL.base}/${ClientURL.start}`)
        .expect(200)
      const resp = await httpRequest
        .get(`${ClientURL.base}/${ClientURL.start}`)
        .expect(200)

      const nowConfig2 = app.getConfig(ConfigKey.clientConfig) as TaskClientConfig
      console.log({ nowConfig2 })

      const { count } = resp.body as TaskAgentState
      assert(count === config.maxRunner, `count: ${count}, config: ${config.maxRunner}`)
    })
  })
})

