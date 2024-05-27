import assert from 'node:assert/strict'

import {
  SEMATTRS_NET_HOST_NAME,
  SEMATTRS_HTTP_METHOD,
  SEMATTRS_HTTP_SCHEME,
  SEMATTRS_HTTP_TARGET,
  SEMATTRS_HTTP_SERVER_NAME,
  SEMATTRS_HTTP_ROUTE,
} from '@opentelemetry/semantic-conventions'

import { AttrNames, Attributes, JaegerTraceInfoSpan } from '##/index.js'


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
  assert(span.operationName === options.operationName, `operationName: ${span.operationName} !== ${options.operationName}`)

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

