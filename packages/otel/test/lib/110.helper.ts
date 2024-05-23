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
  logs?: Attributes[]
}

export function assertRootSpan(options: AssertsRootOptions): void {
  const { path, span, tags } = options
  const operationName = options.operationName ?? `HTTP GET ${path}`
  const logs = options.logs ?? []

  const tags2 = Object.assign({
    [SEMATTRS_HTTP_METHOD]: 'GET',
    [SEMATTRS_HTTP_SCHEME]: 'http',
    [SEMATTRS_HTTP_SERVER_NAME]: 'base-app',
    [SEMATTRS_NET_HOST_NAME]: '127.0.0.1',
    [AttrNames.ServiceName]: 'base-app',
    [AttrNames.ServiceVersion]: '1.0.0',
    'span.kind': 'server',
  }, tags)

  const logs2 = [
    { event: AttrNames.RequestBegin },
    { event: AttrNames.Incoming_Request_data },
    { event: AttrNames.PreProcessFinish },
    { event: AttrNames.PostProcessBegin },
    { event: AttrNames.Outgoing_Response_data, [AttrNames.Http_Response_Code]: 200 },
    { event: AttrNames.RequestEnd },
  ]

  const opt: AssertsOptions = {
    traceId: options.traceId,
    operationName,
    tags: tags2,
    logs: [...logs2, ...logs],
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

  const tags = Object.assign({
    'otel.status_code': 'OK',
  }, span.tags)

  // @ts-expect-error
  span.tags.forEach((tag: Attributes) => {
    const { key, value } = tag
    if (! key) { return }

    // @ts-expect-error
    if (Object.prototype.hasOwnProperty.call(options.tags, key)) {
      // @ts-expect-error
      const expect = options.tags[key]
      assert(value === expect, `${key.toString()}: ${value?.toString()} !== ${expect}`)
    }
  })

  if (options.logs?.length) {
    // @ts-expect-error log type
    span.logs.forEach((log: Attributes, idx) => {
      const { key, value } = log
      if (! key) { return }
      if (! options.logs) { return }

      const expectLog = options.logs[idx]
      if (! expectLog) { return }

      // @ts-expect-error
      if (Object.prototype.hasOwnProperty.call(expectLog, key)) {
        // @ts-expect-error
        const expect = options.tags[key]
        assert(value === expect, `${key.toString()}: ${value?.toString()} !== ${expect}`)
      }
    })

  }
}

