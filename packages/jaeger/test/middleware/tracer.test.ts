
import { createApp, close } from '@midwayjs/mock'
import {
  Framework,
  IMidwayWebApplication,
  IMidwayWebContext,
  MidwayWebMiddleware,
} from '@midwayjs/web'
import { basename } from '@waiting/shared-core'

import { testConfig } from '../test-config'

import { HeadersKey } from '~/lib/types'
import { TracerMiddleware } from '~/middleware/tracer.middleware'

// eslint-disable-next-line import/order
import assert = require('power-assert')




const filename = basename(__filename)

describe(filename, () => {
  let app: IMidwayWebApplication

  before(() => {
    app = testConfig.app
  })

  it('Should work', async () => {
    const ctx: IMidwayWebContext = app.createAnonymousContext()
    const inst = await ctx.requestContext.getAsync(TracerMiddleware)
    const mw = inst.resolve() as MidwayWebMiddleware
    // @ts-expect-error
    await mw(ctx, next)
    const span = ctx.tracerManager.currentSpan()
    assert(span)
  })

  it('Should work with parent span', async () => {
    const ctx: IMidwayWebContext = app.createAnonymousContext()
    const parentSpanId = '123'
    ctx.request.headers[HeadersKey.traceId] = `${parentSpanId}:${parentSpanId}:0:1`
    const inst = await ctx.requestContext.getAsync(TracerMiddleware)
    const mw = inst.resolve()
    // @ts-expect-error
    await mw(ctx, next)
    const spanHeaderInit = ctx.tracerManager.headerOfCurrentSpan()
    assert(spanHeaderInit)
    const header = spanHeaderInit[HeadersKey.traceId]
    const expectParentSpanId = header.slice(0, header.indexOf(':'))
    assert(expectParentSpanId === parentSpanId)
  })

  it('Should work if path match whitelist string', async () => {
    const ctx: IMidwayWebContext = app.createAnonymousContext()
    const inst = await ctx.requestContext.getAsync(TracerMiddleware)
    const mw = inst.resolve()
    ctx.path = '/untraced_path_string'
    // @ts-expect-error
    await mw(ctx, next)
    assert(ctx.tracerManager.isTraceEnabled === false)
  })

  it('Should work if path match whitelist regexp', async () => {
    const ctx: IMidwayWebContext = app.createAnonymousContext()
    const inst = await ctx.requestContext.getAsync(TracerMiddleware)
    const mw = inst.resolve() as MidwayWebMiddleware
    ctx.path = '/untraced_path_reg_exp'
    // @ts-expect-error
    await mw(ctx, next)
    assert(ctx.tracerManager.isTraceEnabled === false)
  })

  it('Should work if path not match whitelist regexp', async () => {
    const ctx: IMidwayWebContext = app.createAnonymousContext()
    const inst = await ctx.requestContext.getAsync(TracerMiddleware)
    const mw = inst.resolve() as MidwayWebMiddleware
    ctx.path = '/untraced_path_reg_exp' + Math.random().toString()
    // @ts-expect-error
    await mw(ctx, next)
    assert(ctx.tracerManager.isTraceEnabled === true)
  })
})


async function next(): Promise<void> {
  return void 0
}

