import { relative } from 'path'

import { testConfig } from '@/root.config'
import { Application } from '~/interface'
import { TracerManager } from '~/lib/tracer'
import { HeadersKey, SpanHeaderInit } from '~/lib/types'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  it('should work if enabled', async () => {
    const tracerManager = new TracerManager(true)
    tracerManager.startSpan('mySpan')
    assert(tracerManager.currentSpan())
    tracerManager.finishSpan()
    // 保留根 span
    assert(tracerManager.currentSpan())
  })
  it('new span should be child of preceding span', async () => {
    const tracerManager = new TracerManager(true)
    tracerManager.startSpan('span1')
    const spanHeaderInit1 = tracerManager.headerOfCurrentSpan() as SpanHeaderInit
    assert(spanHeaderInit1)
    const header1 = spanHeaderInit1[HeadersKey.traceId]

    tracerManager.startSpan('span2')
    const spanHeaderInit2 = tracerManager.headerOfCurrentSpan() as SpanHeaderInit
    assert(spanHeaderInit2)
    const header2 = spanHeaderInit2[HeadersKey.traceId]

    assert(header2.split(':')[2] === header1.split(':')[0])
  })
  it('should not work if disabled', async () => {
    const tracerManager = new TracerManager(false)
    tracerManager.startSpan('mySpan')
    assert(tracerManager.currentSpan() === undefined)
  })
  it('should header be undefined if no span', async () => {
    const tracerManager = new TracerManager(false)
    const headersInit = tracerManager.headerOfCurrentSpan()
    assert(typeof headersInit === 'undefined')
  })
})

