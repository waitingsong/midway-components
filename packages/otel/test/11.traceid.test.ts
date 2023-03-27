import assert from 'node:assert/strict'
import { relative } from 'node:path'

import { makeHttpRequest } from '@midwayjs/core'
import { sleep } from '@waiting/shared-core'

import { testConfig } from '@/root.config'
import { exporterEndpoint } from '~/lib/config'
import { JaegerTraceInfo, JaegerTraceInfoSpan } from '~/lib/types'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')
const agent = exporterEndpoint.replace(/:\d+$/u, '')
assert(agent, 'OTEL_EXPORTER_OTLP_ENDPOINT not set')

describe(filename, () => {

  const path = '/_otel/id'
  const path2 = '/_otel/id2'

  it(`Should ${path} work`, async () => {
    const { app, httpRequest } = testConfig

    const resp = await httpRequest
      .get(path)
      .expect(200)

    const traceId = resp.text as string
    assert(traceId.length === 32)
    console.log({ traceId })

    await sleep(1000)

    const tracePath = `${agent}:16686/api/traces/${traceId}?prettyPrint=true`
    let resp2 = await makeHttpRequest(tracePath, {
      method: 'GET',
      dataType: 'json',
    })
    if (resp2.status !== 200 || ! resp2.data) {
      console.log('retry...')
      await sleep(3000)
      resp2 = await makeHttpRequest(tracePath, {
        method: 'GET',
        dataType: 'json',
      })
    }

    const { data } = resp2.data as {data: [JaegerTraceInfo]}
    assert(Array.isArray(data))
    assert(data.length === 1)
    const [info] = data
    assert(info)
    assert(info.traceID)
    assert(info.traceID === traceId, info.traceID)

    console.log({ spans: info.spans })
    const [span0, span1] = info.spans
    assert(span0, 'span0 not found')
    assert(span1, 'span1 not found')

    assert(span0.spanID)
    assert(span1.spanID)

    assert(span0.traceID === traceId)
    assert(span1.traceID === traceId)

    assert(span0.operationName === 'DefaultComponentService/hello')
    const [ref0] = span0.references
    assert(ref0)

    assert(span1.operationName === `HTTP GET ${path}`)
    assert(! span1.references.length)

    assert(ref0.refType === 'CHILD_OF')
    assert(ref0.traceID === traceId)
    assert(ref0.spanID === span1.spanID)

  })


  it(`Should ${path2} work`, async () => {
    const { httpRequest } = testConfig

    const resp = await httpRequest
      .get(path2)
      .expect(200)

    const traceId = resp.text as string
    assert(traceId.length === 32)
    console.log({ traceId })

    assert(agent)
    await sleep(1000)

    const tracePath = `${agent}:16686/api/traces/${traceId}?prettyPrint=true`
    console.log({ path2: tracePath })
    let resp2 = await makeHttpRequest(tracePath, {
      method: 'GET',
      dataType: 'json',
    })
    if (resp2.status !== 200) {
      await sleep(3000)
      resp2 = await makeHttpRequest(tracePath, {
        method: 'GET',
        dataType: 'json',
      })
    }

    const { data } = resp2.data as {data: [JaegerTraceInfo]}
    assert(Array.isArray(data))
    assert(data.length === 1)
    const [info] = data
    assert(info.traceID === traceId)

    assert(
      info.spans.length === 3,
      typeof info.spans.length === 'number' ? info.spans.length.toString() : 'n/a',
    )
    const [span0, span1, span2] = info.spans
    assert(span0)
    assert(span1)
    assert(span2)

    console.log({
      spanId0: span0.spanID,
      spanId1: span1.spanID,
      spanId2: span2.spanID,
    })

    assert(span0.spanID)
    assert(span1.spanID)
    assert(span2.spanID)

    assert(span0.traceID === traceId)
    assert(span1.traceID === traceId)
    assert(span2.traceID === traceId)

    console.log({ span0 })
    // console.log({ span0Name: span0.operationName })
    // console.log({ span1Name: span1.operationName })
    // console.log({ span2Name: span2.operationName })
    // { span0Name: 'DefaultComponentService/hello' }
    // { span1Name: 'DefaultComponentController/traceId2' }
    // { span2Name: 'HTTP GET /_otel/id2' }

    assert(
      span0.operationName === 'DefaultComponentService/hello'
      || span0.operationName === 'DefaultComponentController/traceId2'
      || span0.operationName === '/_otel/id2',
      span0.operationName,
    )


    if (validateSpanParent(traceId, span0, span1)) {
      assertsSpanParent(traceId, span1, span2)
      assert(
        span1.operationName === 'DefaultComponentController/traceId2',
        span1.operationName,
      )
      assert(
        span2.operationName === `HTTP GET ${path2}`,
        span2.operationName,
      )
      assert(! span2.references.length)
    }
    else if (validateSpanParent(traceId, span0, span2)) {
      assertsSpanParent(traceId, span2, span1)
      assert(
        span2.operationName === 'DefaultComponentController/traceId2',
        span2.operationName,
      )
      assert(
        span1.operationName === `HTTP GET ${path2}`,
        span1.operationName,
      )
      assert(! span1.references.length)
    }
    else {
      assert(false, 'span0 parent not found')
    }
  })
})

function validateSpanParent(
  traceId: string,
  span: JaegerTraceInfoSpan,
  parentSpan: JaegerTraceInfoSpan,
): boolean {

  assert(span)
  assert(parentSpan)

  const [ref0] = span.references
  assert(ref0)

  const [ref1] = parentSpan.references
  if (! ref1) { // parentSpan should not root span
    return false
  }

  assert(ref0.refType === 'CHILD_OF')
  assert(ref0.traceID === traceId)

  if (ref0.spanID === parentSpan.spanID) {
    return true
  }

  return false
}


function assertsSpanParent(
  traceId: string,
  span: JaegerTraceInfoSpan,
  parentSpan: JaegerTraceInfoSpan,
): void {

  assert(span)
  assert(parentSpan)

  const [ref0] = span.references
  assert(ref0)

  const [ref1] = parentSpan.references
  assert(! ref1) // must root

  assert(ref0.refType === 'CHILD_OF')
  assert(ref0.traceID === traceId)

  assert(ref0.spanID === parentSpan.spanID, JSON.stringify({
    spanRefSpanId: ref0.spanID,
    parentSpanId: parentSpan.spanID,
  }))
}

