import assert from 'assert/strict'
import { relative } from 'path'

import { testConfig } from '@/root.config'
import { ConfigKey } from '~/lib/config'
import { getComponentConfig } from '~/util/common'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('Should processPriority() work', () => {
    const path = '/processPriority'

    it('reqThrottleMsForPriority -1', async () => {
      const { app, httpRequest } = testConfig

      const config = getComponentConfig(app)
      config.reqThrottleMsForPriority = -1
      app.addConfigObject({
        [ConfigKey.config]: config,
      })

      const tracerConfig = getComponentConfig(app)
      assert(tracerConfig.reqThrottleMsForPriority === -1)

      const resp = await httpRequest
        .get(path)
      const cost = resp.text
      assert(cost === 'undefined')
    })

    it('reqThrottleMsForPriority 10000', async () => {
      const { app, httpRequest } = testConfig

      const tracerConfig = getComponentConfig(app)
      tracerConfig.reqThrottleMsForPriority = 10000
      app.addConfigObject({
        [ConfigKey.config]: tracerConfig,
      })

      const resp = await httpRequest
        .get(path)
      const cost = resp.body as number
      assert(typeof cost === 'number')
      assert(cost < tracerConfig.reqThrottleMsForPriority)
    })

    it('reqThrottleMsForPriority zero', async () => {
      const { app, httpRequest } = testConfig

      const tracerConfig = getComponentConfig(app)
      tracerConfig.reqThrottleMsForPriority = 10000
      tracerConfig.reqThrottleMsForPriority = 0
      app.addConfigObject({
        [ConfigKey.config]: tracerConfig,
      })

      const resp = await httpRequest
        .get(path)
      const cost = resp.body as number
      assert(typeof cost === 'number')
      assert(cost >= tracerConfig.reqThrottleMsForPriority)
    })

  })
})

