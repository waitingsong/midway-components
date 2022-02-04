/* eslint-disable import/order */
import { relative } from 'path'

import { testConfig } from '@/root.config'
import { TracerConfig } from '~/lib/types'

import assert = require('power-assert')


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('Should processPriority() work', () => {
    const path = '/processPriority'

    it('reqThrottleMsForPriority -1', async () => {
      const { app, httpRequest } = testConfig

      const tracerConfig = app.getConfig('tracer') as TracerConfig
      tracerConfig.reqThrottleMsForPriority = -1

      const resp = await httpRequest
        .get(path)
      const cost = resp.text
      assert(cost === 'undefined')
    })

    it('reqThrottleMsForPriority 10000', async () => {
      const { app, httpRequest } = testConfig

      const tracerConfig = app.getConfig('tracer') as TracerConfig
      tracerConfig.reqThrottleMsForPriority = 10000

      const resp = await httpRequest
        .get(path)
      const cost = resp.body as number
      assert(typeof cost === 'number')
      assert(cost < tracerConfig.reqThrottleMsForPriority)
    })

    it('reqThrottleMsForPriority zero', async () => {
      const { app, httpRequest } = testConfig

      const tracerConfig = app.getConfig('tracer') as TracerConfig
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

