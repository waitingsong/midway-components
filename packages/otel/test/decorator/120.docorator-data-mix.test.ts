import assert from 'node:assert/strict'

import { SEMATTRS_HTTP_ROUTE, SEMATTRS_HTTP_TARGET } from '@opentelemetry/semantic-conventions'
import { fileShortPath } from '@waiting/shared-core'

import {
  AttrNames,
  HeadersKey,
  assertJaegerParentSpanArray, assertRootSpan,
  assertsSpan,
  retrieveTraceInfoFromRemote,
  retrieveTraceparentFromHeader,
  sortSpans,
} from '##/index.js'
import type { AssertsOptions } from '##/index.js'
import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), function () {

  const path1 = `${apiBase.decorator_data}/${apiMethod.mix_on_async}`
  const path2 = `${apiBase.decorator_data}/${apiMethod.mix_on_sync}`

  it(`Should ${path1} work`, async () => {
    const { httpRequest, testSuffix } = testConfig

    const id = Math.random().toString(36).slice(2)
    const resp = await httpRequest.get(`${path1}/${id}`)

    assert(resp.ok, resp.text)
    const ret = resp.text
    assert(ret)
    const [traceId, rnd] = ret.split(':')
    assert(traceId, ret)
    assert(rnd === id, ret)

    const [info] = await retrieveTraceInfoFromRemote(traceId, 3)
    assert(info)
    console.log('--------------------', { info })
    const { spans } = info
    spans.forEach((span, idx) => {
      console.info(idx, { span })
    })

    const [rootSpan, span1, span2] = sortSpans(spans)
    assert(rootSpan)
    assert(span1)
    assert(span2)

    assertJaegerParentSpanArray([
      { parentSpan: rootSpan, childSpan: span1 },
      { parentSpan: span1, childSpan: span2 },
    ])

    assertRootSpan({
      path: path1,
      span: rootSpan,
      traceId,
      operationName: `HTTP GET ${path1}/:id`,
      tags: {
        [SEMATTRS_HTTP_TARGET]: `${path1}/${id}`,
        [SEMATTRS_HTTP_ROUTE]: `${path1}/:id`,
        rootAttrs: 'rootAttrs',
      },
      logs: [
        {},
        false,
        {},
        { event: 'default', rootAttrs: 'rootAttrs' },
        false,
        false,
        false,
      ],
    })

    const opt1: AssertsOptions = {
      traceId,
      operationName: 'DecoratorDataComponentController/mixOnAsync',
      tags: {
        'caller.class': 'DecoratorDataComponentController',
        'caller.method': 'mixOnAsync',
        'span.kind': 'client',
      },
    }
    assertsSpan(span1, opt1)

    const opt2: AssertsOptions = {
      traceId,
      operationName: 'DecoratorDataComponentController/_mixOnAsync',
      tags: {
        'caller.class': 'DecoratorDataComponentController',
        'caller.method': '_mixOnAsync',
        'span.kind': 'client',
        args0: id,
      },
      logs: [
        { event: 'before', args0: id },
        { event: 'after', args0: id, res: `${id}${testSuffix}` },
      ],
    }
    assertsSpan(span2, opt2)
  })


  it(`Should ${path2} return error`, async () => {
    const { httpRequest, testSuffix } = testConfig

    const id = Math.random().toString(36).slice(2)
    const resp = await httpRequest.get(`${path2}/${id}`)

    assert(! resp.ok, resp.text)
    assert(resp.status === 500)
    assert(resp.text.includes('before() is a AsyncFunction'), resp.text)
    assert(resp.text.includes('class: DecoratorDataComponentController'), resp.text)
    assert(resp.text.includes('method: _MixOnSync'), resp.text)

    const traceparent = retrieveTraceparentFromHeader(resp.header as Headers)
    assert(traceparent)

    const [info] = await retrieveTraceInfoFromRemote(traceparent.traceId, 2)
    assert(info)
    const traceId = info.traceID
    console.log('--------------------', { info })
    const { spans } = info

    const [rootSpan, span1, span2] = sortSpans(spans)
    assert(rootSpan)
    assert(span1)

    const errMsg = '[@mwcp/share] Trace() before() is a AsyncFunction, but decorated method is sync function, class: DecoratorDataComponentController, method: _MixOnSync'

    assertRootSpan({
      path: path2,
      span: rootSpan,
      traceId,
      operationName: `HTTP GET ${path2}/:id`,
      tags: {
        [SEMATTRS_HTTP_TARGET]: `${path2}/${id}`,
        [SEMATTRS_HTTP_ROUTE]: `${path2}/:id`,
        [AttrNames.HTTP_ERROR_NAME]: 'AssertionError',
        [AttrNames.HTTP_ERROR_MESSAGE]: errMsg,
        [AttrNames.otel_status_code]: 'ERROR',
        error: true,
      },
      logs: [
        {},
        false,
        {},
        false,
        {
          event: `${AttrNames.Outgoing_Response_data}`,
          [AttrNames.Http_Response_Code]: 500,
          [AttrNames.Http_Response_Body]: errMsg,
        },
      ],
    })

    const opt1: AssertsOptions = {
      traceId,
      operationName: 'DecoratorDataComponentController/mixOnSync',
      tags: {
        'caller.class': 'DecoratorDataComponentController',
        'caller.method': 'mixOnSync',
        'span.kind': 'client',
        [AttrNames.HTTP_ERROR_NAME]: 'AssertionError',
        [AttrNames.HTTP_ERROR_MESSAGE]: errMsg,
        [AttrNames.otel_status_code]: 'ERROR',
        error: true,
      },
      logs: [
        {
          event: `${AttrNames.Exception}`,
          [AttrNames.Exception_Type]: 'ERR_ASSERTION',
          [AttrNames.exception_message]: errMsg,
        },
      ],
    }
    assertsSpan(span1, opt1)
  })
})


