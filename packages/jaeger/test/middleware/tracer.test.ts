import { relative } from 'path'

import { testConfig } from '@/root.config'
import { HeadersKey } from '~/lib/types'
import { TracerMiddleware } from '~/middleware/tracer.middleware'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  it('Should work', async () => {
    const { app } = testConfig

    const ctx = app.createAnonymousContext()
    const inst = await ctx.requestContext.getAsync(TracerMiddleware)
    const mw = inst.resolve()
    await mw(ctx, next)
    const span = ctx.tracerManager.currentSpan()
    assert(span)
  })

  it('Should work with parent span', async () => {
    const { app } = testConfig

    const ctx = app.createAnonymousContext()
    const parentSpanId = '123'
    ctx.request.headers[HeadersKey.traceId] = `${parentSpanId}:${parentSpanId}:0:1`
    const inst = await ctx.requestContext.getAsync(TracerMiddleware)
    const mw = inst.resolve()
    await mw(ctx, next)
    const spanHeaderInit = ctx.tracerManager.headerOfCurrentSpan()
    assert(spanHeaderInit)
    const header = spanHeaderInit[HeadersKey.traceId]
    const expectParentSpanId = header.slice(0, header.indexOf(':'))
    assert(expectParentSpanId === parentSpanId)
  })

  it('Should work if path match whitelist string', async () => {
    const { app } = testConfig

    const ctx = app.createAnonymousContext()
    const inst = await ctx.requestContext.getAsync(TracerMiddleware)
    const mw = inst.resolve()
    ctx.path = '/untraced_path_string'
    await mw(ctx, next)
    assert(ctx.tracerManager.isTraceEnabled === false)
  })

  it('Should work if path match whitelist regexp', async () => {
    const { app } = testConfig

    const ctx = app.createAnonymousContext()
    const inst = await ctx.requestContext.getAsync(TracerMiddleware)
    const mw = inst.resolve()
    ctx.path = '/untraced_path_reg_exp'
    await mw(ctx, next)
    assert(ctx.tracerManager.isTraceEnabled === false)
  })

  it('Should work if path not match whitelist regexp', async () => {
    const { app } = testConfig

    const ctx = app.createAnonymousContext()
    const inst = await ctx.requestContext.getAsync(TracerMiddleware)
    const mw = inst.resolve()
    ctx.path = '/untraced_path_reg_exp' + Math.random().toString()
    await mw(ctx, next)
    assert(ctx.tracerManager.isTraceEnabled === true)
  })
})


async function next(): Promise<void> {
  return void 0
}

