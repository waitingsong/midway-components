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

    it('reqThrottleMsForPriority -1', async () => {
      const { app } = testConfig

      const ctx = app.createAnonymousContext() as Context
      const tracerConfig = ctx.app.getConfig('tracer') as TracerConfig
      tracerConfig.reqThrottleMsForPriority = -1

      const inst = await ctx.requestContext.getAsync(TracerMiddleware)
      const mw = inst.resolve()
      await mw(ctx, next)

      const fnName = 'processPriority'
      const fn = mods.__get__(fnName)
      // const fn = mods.__get__(fnName) as (options: ProcessPriorityOpts) => number | undefined

      const opts: ProcessPriorityOpts = {
        starttime: ctx.starttime,
        tracerTags: {},
        trm: ctx.tracerManager,
        tracerConfig,
      }
      const cost = await fn(opts)
      assert(typeof cost === 'undefined')
    })

    it('reqThrottleMsForPriority 10000', async () => {
      const { app } = testConfig

      const ctx = app.createAnonymousContext() as Context
      const tracerConfig = ctx.app.getConfig('tracer') as TracerConfig
      tracerConfig.reqThrottleMsForPriority = 10000

      const inst = await ctx.requestContext.getAsync(TracerMiddleware)
      const mw = inst.resolve()
      await mw(ctx, next)

      const fnName = 'processPriority'
      const fn = mods.__get__(fnName)

      const opts: ProcessPriorityOpts = {
        starttime: ctx.starttime,
        tracerTags: {},
        trm: ctx.tracerManager,
        tracerConfig,
      }
      const cost = await fn(opts)
      console.log({
        cost,
        starttime: ctx.starttime,
        reqThrottleMsForPriority: tracerConfig.reqThrottleMsForPriority,
      })
      assert(cost < tracerConfig.reqThrottleMsForPriority)
    })

    it('reqThrottleMsForPriority zero', async () => {
      const { app } = testConfig

      const ctx = app.createAnonymousContext() as Context
      const tracerConfig = ctx.app.getConfig('tracer') as TracerConfig
      tracerConfig.reqThrottleMsForPriority = 0

      const inst = await ctx.requestContext.getAsync(TracerMiddleware)
      const mw = inst.resolve()
      await mw(ctx, next)

      const fnName = 'processPriority'
      const fn = mods.__get__(fnName)

      const opts: ProcessPriorityOpts = {
        starttime: ctx.starttime,
        tracerTags: {},
        trm: ctx.tracerManager,
        tracerConfig,
      }
      const cost = await fn(opts)
      console.log({
        cost,
        starttime: ctx.starttime,
        reqThrottleMsForPriority: tracerConfig.reqThrottleMsForPriority,
      })
      assert(cost >= tracerConfig.reqThrottleMsForPriority)
    })

  })
})


async function next(): Promise<void> {
  return void 0
}

