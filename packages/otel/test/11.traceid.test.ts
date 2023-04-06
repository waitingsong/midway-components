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
  const path3 = '/_otel/decorator_arg'
  const path4 = '/_otel/decorator_arg2'

  it(`Should ${path} work`, async () => {
    const { app, httpRequest } = testConfig

    const resp = await httpRequest
      .get(path)
      .expect(200)

    const traceId = resp.text as string
    assert(traceId.length === 32)
    console.log({ traceId })

    await sleep(2000)

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

    const op = 'DefaultComponentService/hello'

    if (span0.operationName === op) {
      assert(span1.operationName === `HTTP GET ${path}`)
      assert(! span1.references.length)

      const [ref] = span0.references
      assert(ref)
      assert(ref.refType === 'CHILD_OF')
      assert(ref.traceID === traceId)
      assert(ref.spanID === span1.spanID)
    }
    else if (span0.operationName === `HTTP GET ${path}`) {
      assert(span1.operationName === op)
      assert(span1.references.length === 1)

      const [ref] = span1.references
      assert(ref)
      assert(ref.refType === 'CHILD_OF')
      assert(ref.traceID === traceId)
      assert(ref.spanID === span0.spanID)
    }
    else {
      assert(false, `span0.operationName: ${span0.operationName}`)
    }

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
    await sleep(2000)

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
      info.spans.length === 4,
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
      || span0.operationName === 'DefaultComponentService/helloSync'
      || span0.operationName === 'DefaultComponentController/traceId2'
      || span0.operationName === 'HTTP GET /_otel/id2',
      span0.operationName,
    )

  })


  it(`Should ${path3} work`, async () => {
    const { httpRequest } = testConfig

    const resp = await httpRequest
      .get(path3)
      .expect(200)

    const [traceId, rnd] = resp.text.split(':')
    assert(traceId)
    assert(traceId.length === 32)
    assert(rnd)
    console.log({ traceId, rnd })

    await sleep(2000)

    const tracePath = `${agent}:16686/api/traces/${traceId}?prettyPrint=true`
    const resp2 = await makeHttpRequest(tracePath, {
      method: 'GET',
      dataType: 'json',
    })

    const { data } = resp2.data as {data: [JaegerTraceInfo]}
    assert(Array.isArray(data))
    assert(data.length === 1)
    const [info] = data
    assert(info)
    assert(info.traceID)
    assert(info.traceID === traceId, info.traceID)

    const { spans } = info
    const found = spans.some((span) => {
      if (span.operationName === `foo-${rnd}`) {
        return true
      }
    })
    assert(found, `foo-${rnd} not found`)
  })

  it(`Should ${path4} work`, async () => {
    const { httpRequest } = testConfig

    const resp = await httpRequest
      .get(path4)
      .expect(200)

    const [traceId, rnd, suffix] = resp.text.split(':')
    assert(traceId)
    assert(traceId.length === 32)
    assert(rnd)
    assert(typeof suffix === 'string')
    console.log({ traceId, rnd, suffix })
    const int = parseInt(rnd, 10)
    const opName = `foo-${int + 1}-${suffix}`

    await sleep(2000)

    const tracePath = `${agent}:16686/api/traces/${traceId}?prettyPrint=true`
    const resp2 = await makeHttpRequest(tracePath, {
      method: 'GET',
      dataType: 'json',
    })

    const { data } = resp2.data as {data: [JaegerTraceInfo]}
    assert(Array.isArray(data))
    assert(data.length === 1)
    const [info] = data
    assert(info)
    assert(info.traceID)
    assert(info.traceID === traceId, info.traceID)

    const { spans } = info
    const found = spans.some((span) => {
      if (span.operationName === opName) {
        return true
      }
    })
    assert(found, `${opName} not found`)
  })

})


function spanHasRelationshop(
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
    // return false
    return spanHasRelationshop(traceId, parentSpan, span)
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

