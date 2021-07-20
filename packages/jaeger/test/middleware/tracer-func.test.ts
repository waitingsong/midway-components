/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable import/order */
import {
  IMidwayWebApplication,
  IMidwayWebContext,
  MidwayWebMiddleware,
} from '@midwayjs/web'
import { basename } from '@waiting/shared-core'

import { TracerMiddleware } from '~/middleware/tracer.middleware'
import { TracerConfig } from '~/lib/types'
import { ProcessPriorityOpts } from '~/middleware/helper'
import { testConfig } from '../test-config'

import assert = require('power-assert')
import rewire = require('rewire')


const filename = basename(__filename)

describe(filename, () => {
  const mods = rewire('../../src/middleware/helper')
  let app: IMidwayWebApplication

  before(() => {
    app = testConfig.app
  })

  describe('Should processPriority() work', () => {

    it('reqThrottleMsForPriority -1', async () => {
      const ctx: IMidwayWebContext = app.createAnonymousContext()
      const config = ctx.app.config.tracer as TracerConfig
      config.reqThrottleMsForPriority = -1

      const inst = await ctx.requestContext.getAsync(TracerMiddleware)
      const mw = inst.resolve() as MidwayWebMiddleware
      // @ts-expect-error
      await mw(ctx, next)

      const fnName = 'processPriority'
      const fn = mods.__get__(fnName)
      // const fn = mods.__get__(fnName) as (options: ProcessPriorityOpts) => number | undefined

      const opts: ProcessPriorityOpts = {
        starttime: ctx.starttime,
        trm: ctx.tracerManager,
        tracerConfig: ctx.app.config.tracer,
      }
      const cost = await fn(opts)
      assert(typeof cost === 'undefined')
    })

    it('reqThrottleMsForPriority 10000', async () => {
      const ctx: IMidwayWebContext = app.createAnonymousContext()
      const config = ctx.app.config.tracer as TracerConfig
      config.reqThrottleMsForPriority = 10000

      const inst = await ctx.requestContext.getAsync(TracerMiddleware)
      const mw = inst.resolve()
      // @ts-expect-error
      await mw(ctx, next)

      const fnName = 'processPriority'
      const fn = mods.__get__(fnName)

      const opts: ProcessPriorityOpts = {
        starttime: ctx.starttime,
        trm: ctx.tracerManager,
        tracerConfig: ctx.app.config.tracer,
      }
      const cost = await fn(opts)
      console.log({
        cost,
        starttime: ctx.starttime,
        reqThrottleMsForPriority: config.reqThrottleMsForPriority,
      })
      assert(cost < config.reqThrottleMsForPriority)
    })

    it('reqThrottleMsForPriority zero', async () => {
      const ctx: IMidwayWebContext = app.createAnonymousContext()
      const config = ctx.app.config.tracer as TracerConfig
      config.reqThrottleMsForPriority = 0

      const inst = await ctx.requestContext.getAsync(TracerMiddleware)
      const mw = inst.resolve()
      // @ts-expect-error
      await mw(ctx, next)

      const fnName = 'processPriority'
      const fn = mods.__get__(fnName)

      const opts: ProcessPriorityOpts = {
        starttime: ctx.starttime,
        trm: ctx.tracerManager,
        tracerConfig: ctx.app.config.tracer,
      }
      const cost = await fn(opts)
      console.log({
        cost,
        starttime: ctx.starttime,
        reqThrottleMsForPriority: config.reqThrottleMsForPriority,
      })
      assert(cost >= config.reqThrottleMsForPriority)
    })

  })
})


async function next(): Promise<void> {
  return void 0
}

