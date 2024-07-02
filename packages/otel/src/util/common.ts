/* eslint-disable no-await-in-loop */
import assert from 'node:assert/strict'

import { makeHttpRequest } from '@midwayjs/core'
import {
  SEMATTRS_NET_HOST_NAME,
  SEMATTRS_HTTP_METHOD,
  SEMATTRS_HTTP_SCHEME,
  SEMATTRS_HTTP_SERVER_NAME,
} from '@opentelemetry/semantic-conventions'
import { sleep } from '@waiting/shared-core'

import { exporterEndpoint } from '##/lib/config.js'
import { AttrNames } from '##/lib/index.js'
import type { Attributes, JaegerTraceInfo, JaegerTraceInfoSpan } from '##/lib/index.js'


const agent = exporterEndpoint.replace(/:\d+$/u, '')

export async function retrieveTraceInfoFromRemote(traceId: string, expectSpanNumber?: number): Promise<[JaegerTraceInfo]> {
  assert(agent, 'OTEL_EXPORTER_OTLP_ENDPOINT not set')

  let id = traceId
  if (traceId.includes('-')) {
    const txt = traceId.split('-').at(1)
    assert(txt)
    id = txt
  }

  await sleep(1000)
  // console.log('retrieveTraceInfoFromRemote: ', { traceId })
  const tracePath = `${agent}:16686/api/traces/${id}?prettyPrint=true`
  let resp = await makeHttpRequest(tracePath, {
    method: 'GET',
    dataType: 'json',
  })
  /* c8 ignore next 4 */
    .catch((err) => {
      console.error(`retrieve trace info failed, check agent "${agent}" valid or OTEL_EXPORTER_OTLP_ENDPOINT is correct.`)
      throw err
    })

  for (let i = 0; i < 30; i += 1) {
    assert(resp.status !== 401, `Expect not 401, trace: "${tracePath}"`)
    assert(resp.status !== 404, `Expect not 404, trace: "${tracePath}"`)
    assert(resp.status !== 500, `Expect not 500, trace: "${tracePath}"`)
    if (resp.status === 200 && resp.data) { break }
    /* c8 ignore start */
    const { data } = resp.data as { data: [JaegerTraceInfo] }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (data.length > 0) { break }

    // console.log('retry traceId...')
    await sleep(2000)
    resp = await makeHttpRequest(tracePath, {
      method: 'GET',
      dataType: 'json',
    })
    /* c8 ignore stop */
  }

  const { data } = resp.data as { data: [JaegerTraceInfo] }

  /* c8 ignore next 3 */
  if (! expectSpanNumber) {
    return data
  }

  let { spans } = data[0]
  if (spans.length >= expectSpanNumber) {
    return data
  }


  /* c8 ignore start */
  for (let i = 0; i < 30; i += 1) {
    // console.info('retry span... idx:', i)
    await sleep(2000)
    const resp2 = await retrieveTraceInfoFromRemote(traceId)
    spans = resp2[0].spans
    // console.log('spans.length:', spans.length)
    if (spans.length >= expectSpanNumber) {
      return resp2
    }
  }
  assert(false, `spans.length: ${spans.length}, expectSpanNumber: ${expectSpanNumber}`)
  /* c8 ignore stop */
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
  /* c8 ignore next */
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
  return spans.sort((p1, p2) => {
    return p1.startTime - p2.startTime
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
  const httpMethod = operationName.includes('GET') ? 'GET' : 'POST'
  const expectLogs = options.logs ?? []

  const tags2 = Object.assign({
    [SEMATTRS_HTTP_METHOD]: httpMethod,
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

  Object.entries(options.tags ?? {}).forEach(([key, value]) => {
    const flag = span.tags.some((tag) => {
      const res = tag['key'] === key && tag['value'] === value
      return res
    })
    assert(flag, `${key}: ${value?.toString()} not found`)
  })


  if (options.logs?.length) {
    options.logs.forEach((expectLog, idx) => {
      /* c8 ignore next 2 */
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (! expectLog) { return }
      const log = span.logs[idx]
      assert(log, `log[${idx}] is null`)

      // console.log('================')
      // console.log('idx:', idx)
      // console.log('expectLog:', expectLog)
      // console.log('real log:', log)

      Object.entries(expectLog).forEach(([key, value]) => {
        const flag = log.fields.some((field) => {
          const res = field.key === key && field.value === value
          return res
        })
        assert(flag, `(${idx}) ${key}: ${value?.toString()} not found`)
      })
    })

  }
}

// function sortSpansByStartTimeDesc(spans: JaegerTraceInfoSpan[]): JaegerTraceInfoSpan[] {
//   return spans.sort((a, b) => {
//     return b.startTime - a.startTime
//   })
// }
