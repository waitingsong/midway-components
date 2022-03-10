import assert from 'assert/strict'
import { relative } from 'path'

import { testConfig } from '@/root.config'
import { getComponentConfig } from '~/util/common'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('Should processPriority() work', () => {
    const path = '/processPriority'

    it('reqThrottleMsForPriority -1', async () => {
      const { app, httpRequest } = testConfig

      const tracerConfig = getComponentConfig(app)
      tracerConfig.reqThrottleMsForPriority = -1

      const resp = await httpRequest
        .get(path)
      const cost = resp.text
      assert(cost === 'undefined')
    })

    it('reqThrottleMsForPriority 10000', async () => {
      const { app, httpRequest } = testConfig

      const tracerConfig = getComponentConfig(app)
      tracerConfig.reqThrottleMsForPriority = 10000

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

      const resp = await httpRequest
        .get(path)
      const cost = resp.body as number
      assert(typeof cost === 'number')
      assert(cost >= tracerConfig.reqThrottleMsForPriority)
    })

  })
})

