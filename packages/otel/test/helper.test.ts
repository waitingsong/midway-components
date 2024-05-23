/* eslint-disable no-await-in-loop */
import assert from 'node:assert/strict'

import { makeHttpRequest } from '@midwayjs/core'
import { sleep } from '@waiting/shared-core'

import { exporterEndpoint } from '##/lib/config.js'
import { JaegerTraceInfo, JaegerTraceInfoSpan } from '##/lib/types.js'


const agent = exporterEndpoint.replace(/:\d+$/u, '')
assert(agent, 'OTEL_EXPORTER_OTLP_ENDPOINT not set')

export async function retrieveTraceInfoFromRemote(traceId: string, expectSpanNumber?: number): Promise<[JaegerTraceInfo]> {
  const tracePath = `${agent}:16686/api/traces/${traceId}?prettyPrint=true`
  let resp = await makeHttpRequest(tracePath, {
    method: 'GET',
    dataType: 'json',
  })

  for (let i = 0; i < 30; i += 1) {
    if (resp.status === 200 && resp.data) { break }
    const { data } = resp.data as { data: [JaegerTraceInfo] }
    if (data?.length > 0) { break }

    console.log('retry...')
    await sleep(2000)
    resp = await makeHttpRequest(tracePath, {
      method: 'GET',
      dataType: 'json',
    })
  }

  const { data } = resp.data as { data: [JaegerTraceInfo] }

  if (! expectSpanNumber) {
    return data
  }

  let spans = data[0].spans
  if (spans.length >= expectSpanNumber) {
    return data
  }

  for (let i = 0; i < 30; i += 1) {
    console.log('retry span... idx:', i)
    await sleep(2000)
    const resp2 = await retrieveTraceInfoFromRemote(traceId)
    spans = resp2[0].spans
    console.log('spans.length:', spans.length)
    if (spans.length >= expectSpanNumber) {
      return resp2
    }
  }
  assert(false, `spans.length: ${spans.length}, expectSpanNumber: ${expectSpanNumber}`)
}


// 对于 JaegerTraceInfo.spans 入参，对于 JaegerTraceInfo.spans 根据 span.reference 的 spanID 依赖关系进行排序
// 以确保 root span -> span0 -> span1 -> span2 的顺序
export function sortSpans(spans: JaegerTraceInfoSpan[]): JaegerTraceInfoSpan[] {
  assert(spans.length > 0, 'sortSpans() spans.length === 0')
  const map = new Map<string, JaegerTraceInfoSpan>()

  spans.forEach((span) => {
    map.set(span.spanID, span)
  })

  const ret: JaegerTraceInfo['spans'] = []

  // find root
  spans.forEach((span) => {
    const parentSpan = getParentSpan(span, map)
    if (! parentSpan) { // root span
      ret.push(span)
    }
  })

  let limit = 0

  while (ret.length < map.size) {
    const parentSpan = ret.at(-1)
    assert(parentSpan)
    const pid = parentSpan.spanID
    const childSpans = getChildren(pid, spans)
    if (childSpans.length) {
      ret.push(...childSpans)
    }

    limit += 1
    if (limit > 1000) {
      assert(false, 'sortSpans() exec limit')
    }
  }

  return ret
}

function getParentSpan(
  span: JaegerTraceInfo['spans'][0],
  map: Map<string, JaegerTraceInfoSpan>,
): JaegerTraceInfoSpan | undefined {

  if (! span.references.length) { return }

  const ref = span.references[0]
  if (! ref) { return }

  return map.get(ref.spanID)
}



function getChildren(
  parentSpanId: string,
  spans: JaegerTraceInfo['spans'],
): JaegerTraceInfoSpan[] {

  const ret: JaegerTraceInfoSpan[] = []

  assert(parentSpanId)
  spans.forEach((span) => {
    const ref = span.references[0]
    if (ref && ref.spanID === parentSpanId) {
      ret.push(span)
    }
  })

  if (ret.length > 1) {
    sortSpansByStartTime(ret)
  }
  return ret
}

function sortSpansByStartTime(spans: JaegerTraceInfoSpan[]): JaegerTraceInfoSpan[] {
  return spans.sort((a, b) => {
    return a.startTime - b.startTime
  })
}

// function sortSpansByStartTimeDesc(spans: JaegerTraceInfoSpan[]): JaegerTraceInfoSpan[] {
//   return spans.sort((a, b) => {
//     return b.startTime - a.startTime
//   })
// }

