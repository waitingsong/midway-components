/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable import/order */
import { relative } from 'path'

import { testConfig } from '@/root.config'
import { TracerMiddleware } from '~/middleware/tracer.middleware'
import { TracerConfig } from '~/lib/types'
import { ProcessPriorityOpts } from '~/middleware/helper'
import { Context } from '~/interface'

import assert = require('power-assert')
import rewire = require('rewire')


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {
  const mods = rewire('../../src/middleware/helper')

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

    it.only('reqThrottleMsForPriority 10000', async () => {
      const { app, httpRequest } = testConfig

      const tracerConfig = app.getConfig('tracer') as TracerConfig
      tracerConfig.reqThrottleMsForPriority = 10000

      const resp = await httpRequest
        .get(path)
      const cost = resp.body
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
      const cost = resp.body
      assert(typeof cost === 'number')
      assert(cost >= tracerConfig.reqThrottleMsForPriority)
    })

  })
})

