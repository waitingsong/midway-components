/* c8 ignore start */
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import type * as http from 'node:http'
import type * as https from 'node:https'
import type * as url from 'node:url'

import type { Attributes, Span } from '@opentelemetry/api'
import type { InstrumentationConfig } from '@opentelemetry/instrumentation'


export type IgnoreMatcher = string | RegExp | ((url: string) => boolean)
export type HttpCallback = (res: http.IncomingMessage) => void
export type RequestFunction = typeof http.request
export type GetFunction = typeof http.get

export type HttpCallbackOptional = HttpCallback | undefined

// from node 10+
export type RequestSignature = [http.RequestOptions, HttpCallbackOptional] &
  HttpCallback

export type HttpRequestArgs = (HttpCallbackOptional | RequestSignature)[]

export type ParsedRequestOptions =
  | (http.RequestOptions & Partial<url.UrlWithParsedQuery>)
  | http.RequestOptions
export type Http = typeof http
export type Https = typeof https
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Func<T> = (...args: any[]) => T
export type ResponseEndArgs =
  | [((() => void) | undefined)?]
  | [unknown, ((() => void) | undefined)?]
  | [unknown, string, ((() => void) | undefined)?]

export type HttpCustomAttributeFunction = (
  span: Span,
  request: http.ClientRequest | http.IncomingMessage,
  response: http.IncomingMessage | http.ServerResponse
) => void

export type IgnoreIncomingRequestFunction = (request: http.IncomingMessage) => boolean

export type IgnoreOutgoingRequestFunction = (request: http.RequestOptions) => boolean

export type HttpRequestCustomAttributeFunction = (span: Span, request: http.ClientRequest | http.IncomingMessage) => void

export type HttpResponseCustomAttributeFunction = (span: Span, response: http.IncomingMessage | http.ServerResponse) => void

export type StartIncomingSpanCustomAttributeFunction = (request: http.IncomingMessage) => Attributes

export type StartOutgoingSpanCustomAttributeFunction = (request: http.RequestOptions) => Attributes

/**
 * Options available for the HTTP instrumentation (see [documentation](https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-instrumentation-http#http-instrumentation-options))
 */
export interface HttpInstrumentationConfig extends InstrumentationConfig {
  /**
   * Not trace all incoming requests that match paths
   * @deprecated use `ignoreIncomingRequestHook` instead
   */
  ignoreIncomingPaths?: IgnoreMatcher[]
  /** Not trace all incoming requests that matched with custom function */
  ignoreIncomingRequestHook?: IgnoreIncomingRequestFunction
  /** Not trace all outgoing requests that matched with custom function */
  ignoreOutgoingRequestHook?: IgnoreOutgoingRequestFunction
  /** Function for adding custom attributes after response is handled */
  applyCustomAttributesOnSpan?: HttpCustomAttributeFunction
  /** Function for adding custom attributes before request is handled */
  requestHook?: HttpRequestCustomAttributeFunction
  /** Function for adding custom attributes before response is handled */
  responseHook?: HttpResponseCustomAttributeFunction
  /** Function for adding custom attributes before a span is started in incomingRequest */
  startIncomingSpanHook?: StartIncomingSpanCustomAttributeFunction
  /** Function for adding custom attributes before a span is started in outgoingRequest */
  startOutgoingSpanHook?: StartOutgoingSpanCustomAttributeFunction
  /** The primary server name of the matched virtual host. */
  serverName?: string
  /** Require parent to create span for outgoing requests */
  requireParentforOutgoingSpans?: boolean
  /** Require parent to create span for incoming requests */
  requireParentforIncomingSpans?: boolean
  /** Map the following HTTP headers to span attributes. */
  headersToSpanAttributes?: {
    client?: { requestHeaders?: string[], responseHeaders?: string[] },
    server?: { requestHeaders?: string[], responseHeaders?: string[] },
  }
}

// export interface Err extends Error {
//   errno?: number
//   code?: string
//   path?: string
//   syscall?: string
//   stack?: string
// }

/* c8 ignore stop */
