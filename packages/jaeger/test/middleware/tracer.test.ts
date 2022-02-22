// import assert from 'assert'
import { relative } from 'path'

import { testConfig, TestRespBody } from '@/root.config'
import { Context } from '~/interface'
import { HeadersKey, TestSpanInfo, TracerLog } from '~/lib/types'
import { TracerMiddleware } from '~/middleware/tracer.middleware'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {
  const path = '/'

  it.only('Should work', async () => {
    const { app, httpRequest } = testConfig

    const resp = await httpRequest
      .get(path)
      .expect(200)
    const { spanInfo } = resp.body as TestRespBody
    assertSpanInfo(spanInfo)
    const expectTags = [
      {
        key: 'sampler.type',
        value: 'probabilistic',
      },
      {
        key: 'sampler.param',
        value: 1,
      },
    ]
    assert.deepStrictEqual(spanInfo.tags, expectTags)
  })

  it.only('Should work with parent span', async () => {
    const { app, httpRequest } = testConfig

    const ctx = app.createAnonymousContext() as Context
    const parentSpanId = Math.random().toString().slice(2)

    const sendHeader = {
      [HeadersKey.traceId]: `${parentSpanId}:${parentSpanId}:0:1`,
    }
    const resp = await httpRequest
      .get(path)
      .set(sendHeader)
      .expect(200)
    const { spanInfo } = resp.body as TestRespBody
    assertSpanInfo(spanInfo)

    assert(spanInfo.tags.length === 0)

    const { headerInit } = spanInfo
    if (headerInit) {
      const header = headerInit[HeadersKey.traceId]
      const expectParentSpanId = header.slice(0, header.indexOf(':'))
      assert(expectParentSpanId === parentSpanId)
    }
  })

  it('Should work if path match whitelist string', async () => {
    const { app } = testConfig

    const ctx = app.createAnonymousContext() as Context
    const inst = await ctx.requestContext.getAsync(TracerMiddleware)
    const mw = inst.resolve()
    ctx.path = '/untraced_path_string'
    await mw(ctx, next)
    assert(ctx.tracerManager.isTraceEnabled === false)
  })

  it('Should work if path match whitelist regexp', async () => {
    const { app } = testConfig

    const ctx = app.createAnonymousContext() as Context
    const inst = await ctx.requestContext.getAsync(TracerMiddleware)
    const mw = inst.resolve()
    ctx.path = '/untraced_path_reg_exp'
    await mw(ctx, next)
    assert(ctx.tracerManager.isTraceEnabled === false)
  })

  it('Should work if path not match whitelist regexp', async () => {
    const { app } = testConfig

    const ctx = app.createAnonymousContext() as Context
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


function assertSpanInfo(spanInfo: TestSpanInfo): void {
  assert(spanInfo)
  const { startTime, logs, tags } = spanInfo

  assert(startTime > 0)
  assert(Array.isArray(logs) && logs.length > 0)
  assert(Array.isArray(tags))

  const [log0] = logs
  assert(log0)
  if (log0) {
    assert(log0.timestamp > 0)
    const { fields } = log0
    assert(Array.isArray(fields))
    const [row0] = fields
    assert(row0)
    if (row0) {
      assert(row0.key === 'event')
      assert(row0.value === TracerLog.requestBegin)
    }
  }
}
