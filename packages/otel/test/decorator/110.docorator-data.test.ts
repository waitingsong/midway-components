import assert from 'node:assert/strict'

import { SEMATTRS_HTTP_ROUTE, SEMATTRS_HTTP_TARGET } from '@opentelemetry/semantic-conventions'
import { fileShortPath } from '@waiting/shared-core'

import {
  assertJaegerParentSpanArray,
  assertRootSpan,
  assertsSpan,
  retrieveTraceInfoFromRemote, sortSpans,
} from '##/index.js'
import type { AssertsOptions } from '##/index.js'
import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), function () {

  const path1 = `${apiBase.decorator_data}/${apiMethod.async}`
  const path2 = `${apiBase.decorator_data}/${apiMethod.sync}`

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
    const { spans } = info
    assert(spans.length)
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
        {},
        {},
        { event: 'default', rootAttrs: 'rootAttrs' },
        false,
        false,
        false,
      ],
    })

    const opt1: AssertsOptions = {
      traceId,
      operationName: 'DecoratorDataComponentController/traceIdAsync',
      tags: {
        'caller.class': 'DecoratorDataComponentController',
        'caller.method': 'traceIdAsync',
        'span.kind': 'client',
      },
    }
    assertsSpan(span1, opt1)

    const opt2: AssertsOptions = {
      traceId,
      operationName: 'DecoratorDataComponentController/traceDecoratorDataAsync',
      tags: {
        'caller.class': 'DecoratorDataComponentController',
        'caller.method': 'traceDecoratorDataAsync',
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


  it(`Should ${path2} work`, async () => {
    const { httpRequest, testSuffix } = testConfig

    const id = Math.random().toString(36).slice(2)
    const resp = await httpRequest.get(`${path2}/${id}`)

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
    assert(spans.length)
    spans.forEach((span, idx) => {
      console.info(idx, { span })
    })

    const [rootSpan, span1, span2] = sortSpans(spans)
    assert(rootSpan)
    assert(span1)
    assert(span2)

    assertRootSpan({
      path: path2,
      span: rootSpan,
      traceId,
      operationName: `HTTP GET ${path2}/:id`,
      tags: {
        [SEMATTRS_HTTP_TARGET]: `${path2}/${id}`,
        [SEMATTRS_HTTP_ROUTE]: `${path2}/:id`,
        rootAttrs: 'rootAttrs',
      },
      logs: [
        {},
        {},
        {},
        { event: 'default', rootAttrs: 'rootAttrs' },
        false,
        false,
        false,
      ],
    })

    const opt1: AssertsOptions = {
      traceId,
      operationName: 'DecoratorDataComponentController/traceIdSync',
      tags: {
        'caller.class': 'DecoratorDataComponentController',
        'caller.method': 'traceIdSync',
        'span.kind': 'client',
      },
    }
    assertsSpan(span1, opt1)

    const opt2: AssertsOptions = {
      traceId,
      operationName: 'DecoratorDataComponentController/traceDecoratorDataSync',
      tags: {
        'caller.class': 'DecoratorDataComponentController',
        'caller.method': 'traceDecoratorDataSync',
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
})


