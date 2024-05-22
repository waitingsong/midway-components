import assert from 'node:assert'
import type {
  IncomingHttpHeaders,
  IncomingMessage,
  OutgoingHttpHeaders,
  OutgoingMessage,
} from 'node:http'

import { Context as WebContext, getRouterInfo } from '@mwcp/share'
import {
  Attributes,
  Span,
  SpanStatusCode,
  SpanKind,
  propagation,
  Context,
  createContextKey,
} from '@opentelemetry/api'
import {
  NETTRANSPORTVALUES_IP_TCP,
  NETTRANSPORTVALUES_IP_UDP,
  SEMATTRS_NET_TRANSPORT,
  SEMATTRS_HTTP_FLAVOR,
  SEMATTRS_HTTP_CLIENT_IP,
  SEMATTRS_HTTP_USER_AGENT,
  SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH,
  SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED,
  SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH,
  SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED,
  SEMATTRS_HTTP_URL,
  SEMATTRS_HTTP_HOST,
  SEMATTRS_NET_HOST_NAME,
  SEMATTRS_HTTP_METHOD,
  SEMATTRS_HTTP_SCHEME,
  SEMATTRS_HTTP_TARGET,
  SEMATTRS_HTTP_SERVER_NAME,
  SEMATTRS_HTTP_ROUTE,
} from '@opentelemetry/semantic-conventions'
import type { Headers as UndiciHeaders } from 'undici'

import { AttrNames, Config } from './types.js'


const defaultProperty: PropertyDescriptor = {
  configurable: true,
  enumerable: true,
  writable: false,
}


/**
 * span key
 */
const SPAN_KEY = createContextKey('OpenTelemetry Context Key SPAN')
/**
 * Return the span if one exists
 *
 * @param context context to get span from
 */
export function getSpan(context: Context): Span | undefined {
  return context.getValue(SPAN_KEY) as Span | undefined
}
/**
 * Set the span on a context
 *
 * @param context context to use as parent
 * @param span span to set active
 */
export function setSpan(context: Context, span: Span): Context {
  return context.setValue(SPAN_KEY, span)
}
/**
 * Remove current span stored in the context
 *
 * @param context context to delete span from
 */
export function deleteSpan(context: Context): Context {
  return context.deleteValue(SPAN_KEY)
}


/**
 * Parse status code from HTTP response.
 */
export function parseResponseStatus(kind: SpanKind, statusCode?: number): SpanStatusCode {
  const upperBound = kind === SpanKind.CLIENT ? 400 : 500
  // 1xx, 2xx, 3xx are OK on client and server
  // 4xx is OK on server
  if (statusCode && statusCode >= 100 && statusCode < upperBound) {
    return SpanStatusCode.UNSET
  }

  // All other codes are error
  return SpanStatusCode.ERROR
}


/**
 * Adds attributes for request content-length and content-encoding HTTP headers
 * @param { IncomingMessage } Request object whose headers will be analyzed
 * @param { Attributes } Attributes object to be modified
 */
function setRequestContentLengthAttribute(
  request: IncomingMessage,
  attributes: Attributes,
): void {

  const length = getContentLength(request.headers)
  if (length === null) { return }

  if (isCompressed(request.headers)) {
    attributes[SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH] = length

  }
  else {
    attributes[SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED] = length
  }
}

/**
 * Adds attributes for response content-length and content-encoding HTTP headers
 * @param { IncomingMessage } Response object whose headers will be analyzed
 * @param { Attributes } SpanAttributes object to be modified
 */
export function setResponseContentLengthAttribute(
  response: IncomingMessage,
  attributes: Attributes,
): void {

  const length = getContentLength(response.headers)
  if (length === null) { return }

  if (isCompressed(response.headers)) {
    attributes[SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH] = length
  }
  else {
    attributes[
      SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED
    ] = length
  }
}

function getContentLength(headers: OutgoingHttpHeaders | IncomingHttpHeaders): number | null {
  const contentLengthHeader = headers['content-length']
  if (contentLengthHeader === undefined) { return null }

  const contentLength = parseInt(contentLengthHeader as string, 10)
  if (Number.isNaN(contentLength)) { return null }

  return contentLength
}

function isCompressed(headers: OutgoingHttpHeaders | IncomingHttpHeaders): boolean {
  const encoding = headers['content-encoding']

  return !! encoding && encoding !== 'identity'
}


/**
 * Returns attributes related to the kind of HTTP protocol used
 * @param {string} [kind] Kind of HTTP protocol used: "1.0", "1.1", "2", "SPDY" or "QUIC".
 */
function getAttributesFromHttpKind(kind?: string): Attributes {
  const attributes: Attributes = {}
  if (kind) {
    attributes[SEMATTRS_HTTP_FLAVOR] = kind
    if (kind.toUpperCase() === 'QUIC') {
      attributes[SEMATTRS_NET_TRANSPORT] = NETTRANSPORTVALUES_IP_UDP
    }
    else {
      attributes[SEMATTRS_NET_TRANSPORT] = NETTRANSPORTVALUES_IP_TCP
    }
  }
  return attributes
}


/**
 * Returns incoming request attributes scoped to the request data
 */
export async function getIncomingRequestAttributesFromWebContext(
  ctx: WebContext,
  config: Config,
): Promise<Attributes> {

  const routerInfo = await getRouterInfo(ctx)

  const attrs: Attributes = {
    [SEMATTRS_HTTP_HOST]: ctx.host,
    [SEMATTRS_HTTP_METHOD]: ctx.method || 'GET',
    [SEMATTRS_HTTP_ROUTE]: routerInfo?.fullUrl ?? 'unknown',
    [SEMATTRS_HTTP_SCHEME]: ctx.protocol,
    [SEMATTRS_HTTP_SERVER_NAME]: config.serviceName ?? 'unknown',
    [SEMATTRS_HTTP_TARGET]: ctx.path || '/',
    [SEMATTRS_HTTP_URL]: ctx.href,
    [SEMATTRS_NET_HOST_NAME]: ctx.hostname,
    [AttrNames.ServiceName]: config.serviceName ?? 'unknown',
    [AttrNames.ServiceVersion]: config.serviceVersion ?? 'unknown',
    // [AttrNames.ServicePid]: process.pid,
  }

  let httpKindAttributes = {}

  if (typeof ctx[AttrNames.traceId] === 'string') {
    attrs[AttrNames.traceId] = ctx[AttrNames.traceId]
  }

  const { req } = ctx
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (req) {
    const userAgent = req.headers['user-agent']
    const ips = req.headers['x-forwarded-for']

    if (typeof ips === 'string') {
      attrs[SEMATTRS_HTTP_CLIENT_IP] = ips.split(',')[0]
    }

    if (typeof userAgent !== 'undefined') {
      attrs[SEMATTRS_HTTP_USER_AGENT] = userAgent
    }

    // Object.defineProperty(attrs, 'http.request.header.content_type', {
    //   enumerable: true,
    //   writable: false,
    //   value: headers['content-type'],
    // })
    setRequestContentLengthAttribute(req, attrs)

    httpKindAttributes = getAttributesFromHttpKind(req.httpVersion)
  }

  return Object.assign(attrs, httpKindAttributes)
}


/**
 * Key format `http.{request|response}.header.{name}`
 * @param headersKeyMap Map<lowerkey, normalizedkey>
 */
export function genAttributesFromHeader(
  type: 'request' | 'response',
  headersKeyMap: Map<string, string>,
  getHeader: (key: string) => string | number | undefined | string[],
): Attributes | undefined {

  const attrs: Attributes = {}

  for (const [lower, normalized] of headersKeyMap) {
    const data = getHeader(lower)
    if (typeof data === 'undefined' || data === '') { continue }

    const value = Array.isArray(data) ? data : data
    const key = `http.${type}.header.${normalized}`
    Object.defineProperty(attrs, key, {
      enumerable: true,
      writable: false,
      value,
    })
  }

  if (Object.keys(attrs).length) {
    return attrs
  }
  return
}

/**
 * Returns map<lower string, lower and normalized string>
 */
export type NormalizedKeyMap = Map<string, string>

export function normalizeHeaderKey(inputKeys: string[]): NormalizedKeyMap {
  const keys: [string, string][] = inputKeys.map((header) => {
    const str = header.toLowerCase()
    return [str, str.replace(/-/ug, '_')]
  })

  const ret = new Map(keys)
  return ret
}


/**
 * String of JSON.stringify limited to 2048 characters
 */
export function addSpanEventWithIncomingRequestData(
  span: Span,
  ctx: WebContext,
): void {

  const attrs: Attributes = {}

  const { query } = ctx
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (query) {
    if (typeof query === 'string') {
      Object.defineProperty(attrs, AttrNames.Http_Request_Query, {
        ...defaultProperty,
        value: query,
      })
    }
    else if (typeof query === 'object' && Object.keys(query).length) {
      const value = truncateString(JSON.stringify(query, null, 2))
      Object.defineProperty(attrs, AttrNames.Http_Request_Query, {
        ...defaultProperty,
        value,
      })
    }
  }

  const data = ctx.request.body
  if (data && Object.keys(data).length) {
    const value = truncateString(JSON.stringify(data, null, 2))
    Object.defineProperty(attrs, AttrNames.Http_Request_Body, {
      ...defaultProperty,
      value,
    })
  }

  const { headers } = ctx.request
  Object.defineProperty(attrs, 'http.request.header.content_length', {
    ...defaultProperty,
    value: headers['content-length'],
  })
  Object.defineProperty(attrs, 'http.request.header.content_type', {
    ...defaultProperty,
    value: headers['content-type'],
  })

  if (Object.keys(attrs).length) {
    span.addEvent(AttrNames.Incoming_Request_data, attrs)
  }
}

export function propagateOutgoingHeader(
  traceContext: Context,
  message: OutgoingMessage,
): void {

  const headers = {}
  propagation.inject(traceContext, headers)

  Object.entries(headers).forEach(([key, val]) => {
    if (typeof val === 'string' || typeof val === 'number' || Array.isArray(val)) {
      message.setHeader(key, val)
    }
  })
}

/**
 * Skip if header already exists
 */
export function propagateHeader<T extends Headers | UndiciHeaders = Headers>(
  traceContext: Context,
  headers: T,
): void {

  const tmp = {}
  propagation.inject(traceContext, tmp)

  Object.entries(tmp).forEach(([key, val]) => {
    const curr = headers.get(key)
    if (typeof curr !== 'undefined' && curr !== null) { return }

    if (typeof val === 'string' || typeof val === 'number') {
      headers.set(key, val.toString())
    }
    else if (Array.isArray(val)) {
      headers.set(key, val.join(','))
    }
  })
}

/**
   *
   * @param headersKey if omit then use inner prepared headers key
   */
export function setSpanWithRequestHeaders(
  span: Span,
  requestHeadersMap: Map<string, string> | undefined,
  getHeader: (key: string) => string | number | undefined | string[],
  headersKey?: string[],
): void {

  const keyMap = headersKey
    ? normalizeHeaderKey(headersKey)
    : requestHeadersMap

  if (! keyMap?.size) { return }

  const attrs = genAttributesFromHeader('request', keyMap, getHeader)
  if (attrs) {
    span.setAttributes(attrs)
  }
}

/**
 * String of JSON.stringify limited to 2048 characters
 */
export function addSpanEventWithOutgoingResponseData(
  span: Span,
  ctx: WebContext,
): void {

  const attrs: Attributes = {}

  const { body } = ctx
  if (typeof body === 'object') {
    const value = truncateString(JSON.stringify(body, null, 2))
    Object.defineProperty(attrs, AttrNames.Http_Response_Body, {
      ...defaultProperty,
      value,
    })
  }
  else {
    const value = truncateString(JSON.stringify(body, null, 2))
    Object.defineProperty(attrs, AttrNames.Http_Response_Body, {
      ...defaultProperty,
      value,
    })
  }

  Object.defineProperty(attrs, AttrNames.Http_Response_Code, {
    ...defaultProperty,
    value: ctx.status,
  })

  const { headers } = ctx.response
  Object.defineProperty(attrs, 'http.response.header.content_length', {
    ...defaultProperty,
    value: headers['content-length'],
  })
  Object.defineProperty(attrs, 'http.response.header.content_type', {
    ...defaultProperty,
    value: headers['content-type'],
  })

  if (Object.keys(attrs).length) {
    span.addEvent(AttrNames.Outgoing_Response_data, attrs)
  }
}

export function truncateString(str: string, maxLength = 2048): string {
  if (str && str.length > maxLength) {
    return str.slice(0, maxLength) + '... LENGTH: ' + str.length.toString() + ' bytes'
  }
  return str
}

export interface GenRequestSpanNameOptions {
  /** ctx.request?.protocol */
  protocol: string
  /** ctx.method */
  method: string
  route: string
}

/**
 * Generate span name from request
 * @description no leading slash
 * @example 'HTTP GET - api/v1/user'
 */
export function genRequestSpanName(options: GenRequestSpanNameOptions, maxLength = 128): string {
  const { protocol, method, route } = options
  assert(protocol, 'protocol is required')
  assert(method, 'method is required')
  const spanName = `${protocol.toLocaleUpperCase()} ${method.toUpperCase()} ${route}`
  return spanName.slice(0, maxLength)
}

