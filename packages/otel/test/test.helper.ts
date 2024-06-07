/* eslint-disable no-await-in-loop */
import assert from 'node:assert/strict'

import { makeHttpRequest } from '@midwayjs/core'
import {
  SEMATTRS_NET_HOST_NAME,
  SEMATTRS_HTTP_METHOD,
  SEMATTRS_HTTP_SCHEME,
  SEMATTRS_HTTP_TARGET,
  SEMATTRS_HTTP_SERVER_NAME,
  SEMATTRS_HTTP_ROUTE,
} from '@opentelemetry/semantic-conventions'
import { sleep } from '@waiting/shared-core'

import { AttrNames, Attributes, JaegerTraceInfo, JaegerTraceInfoSpan } from '##/index.js'
import { exporterEndpoint } from '##/lib/config.js'

// function sortSpansByStartTimeDesc(spans: JaegerTraceInfoSpan[]): JaegerTraceInfoSpan[] {
//   return spans.sort((a, b) => {
//     return b.startTime - a.startTime
//   })
// }

const agent = exporterEndpoint.replace(/:\d+$/u, '')
assert(agent, 'OTEL_EXPORTER_OTLP_ENDPOINT not set')

export async function retrieveTraceInfoFromRemote(traceId: string, expectSpanNumber?: number): Promise<[JaegerTraceInfo]> {
  console.log({ traceId })
  let id = traceId
  if (traceId.includes('-')) {
    const txt = traceId.split('-').at(1)
    assert(txt)
    id = txt
  }

  const tracePath = `${agent}:16686/api/traces/${id}?prettyPrint=true`
  let resp = await makeHttpRequest(tracePath, {
    method: 'GET',
    dataType: 'json',
  })

  for (let i = 0; i < 30; i += 1) {
    if (resp.status === 200 && resp.data) { break }
    const { data } = resp.data as { data: [JaegerTraceInfo] }
    if (data?.length > 0) { break }

    console.log('retry traceId...')
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

  const ret: JaegerTraceInfoSpan[] = []

  // find root
  // spans.forEach((span) => {
  for (const span of spans) {
    const parentSpan = getParentSpan(span, map)
    if (! parentSpan) { // root span
      ret.push(span)
      break
    }
  }

  const parentSpan = ret.at(-1)
  assert(parentSpan)
  mergeSpans(parentSpan, spans, ret)

  return ret
}

function mergeSpans(parentSpan: JaegerTraceInfoSpan, srcSpans: JaegerTraceInfoSpan[], result: JaegerTraceInfoSpan[]): void {
  assert(parentSpan)
  const pid = parentSpan.spanID
  const childSpans = getChildren(pid, srcSpans)

  if (childSpans.length) { // has child node
    if (parentSpan !== result.at(-1)) {
      result.push(parentSpan)
    }

    childSpans.forEach((child) => { // not leaf node
      mergeSpans(child, srcSpans, result)
    })
  }
  else if (parentSpan !== result.at(-1)) { // leaf node
    result.push(parentSpan)
  }
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


export interface AssertsRootOptions {
  path: string
  span: JaegerTraceInfoSpan
  traceId: string

  operationName?: string
  tags?: Attributes
  logs?: (Attributes | false)[]
}

export function assertRootSpan(options: AssertsRootOptions): void {
  const { path, span, tags } = options
  const operationName = options.operationName ?? `HTTP GET ${path}`
  const expectLogs = options.logs ?? []

  const tags2 = Object.assign({
    [SEMATTRS_HTTP_METHOD]: 'GET',
    [SEMATTRS_HTTP_SCHEME]: 'http',
    [SEMATTRS_HTTP_SERVER_NAME]: 'base-app',
    [SEMATTRS_NET_HOST_NAME]: '127.0.0.1',
    [AttrNames.ServiceName]: 'base-app',
    [AttrNames.ServiceVersion]: '1.0.0',
    'span.kind': 'server',
  }, tags)

  const logBase = [
    { event: AttrNames.RequestBegin },
    { event: AttrNames.Incoming_Request_data },
    { event: AttrNames.PreProcessFinish },
    { event: AttrNames.PostProcessBegin },
    { event: AttrNames.Outgoing_Response_data, [AttrNames.Http_Response_Code]: 200 },
    { event: AttrNames.RequestEnd },
  ]

  const logs: Attributes[] = []

  // const logs = logs2.map((log, idx) => {
  for (let idx = 0; idx < Math.max(logBase.length, expectLogs.length, options.logs?.length ?? 0); idx += 1) {
    const log = logBase[idx] ?? {}
    const expectRow = expectLogs[idx]
    if (expectRow === false) { continue }
    if (expectRow && Object.keys(expectRow).length) {
      const row = Object.assign(log, expectRow)
      logs.push(row)
      continue
    }
    logs.push(log)
  }

  const opt: AssertsOptions = {
    traceId: options.traceId,
    operationName,
    tags: tags2,
    logs,
  }

  assertsSpan(span, opt)
}

export interface AssertsOptions {
  traceId: string
  operationName: string
  tags?: Attributes
  logs?: Attributes[]
}

export function assertsSpan(span: JaegerTraceInfoSpan, options: AssertsOptions): void {
  assert(span, 'span is null')
  assert(options, 'options is null')

  assert(span.traceID === options.traceId)
  assert(span.operationName === options.operationName, `operationName: ${span.operationName} !== (expect) ${options.operationName}`)

  span.tags.forEach((tag: Attributes) => {
    const tag2 = Object.assign({
      'otel.status_code': 'OK',
    }, tag)
    const { key, value } = tag2
    if (! key) { return }

    // @ts-expect-error
    if (Object.prototype.hasOwnProperty.call(options.tags, key)) {
      // @ts-expect-error
      const expect = options.tags[key]
      assert(value === expect, `${key.toString()}: ${value?.toString()} !== ${expect}`)
    }
  })

  if (options.logs?.length) {
    span.logs.forEach((log, idx) => {
      if (! log.fields.length) { return }
      log.fields.forEach((field) => {
        const { key, value } = field
        if (! key) { return }
        if (! options.logs) { return }

        const expectLog = options.logs[idx]
        if (! expectLog) { return }

        if (Object.prototype.hasOwnProperty.call(expectLog, key)) {
          const expect = expectLog[key]
          assert(expect, `${key.toString()} is null`)
          assert(value === expect, `key: ${key.toString()},
          value:
          ${value?.toString()}
          !== expect value:
          ${expect.toString()}`)
        }
      })
    })

  }
}