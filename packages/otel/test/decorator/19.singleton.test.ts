import assert from 'node:assert/strict'

import { SEMATTRS_HTTP_TARGET, SEMATTRS_HTTP_ROUTE } from '@opentelemetry/semantic-conventions'
import { fileShortPath } from '@waiting/shared-core'

import {
  assertsSpan, assertRootSpan,
  retrieveTraceInfoFromRemote, sortSpans,
  assertJaegerParentSpanArray,
} from '##/index.js'
import type { AssertsOptions } from '##/index.js'
import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), function () {
  this.retries(3)

  const path = `${apiBase.define_scope}/${apiMethod.hello}`

  it(`Should ${path} work`, async () => {
    const { httpRequest, validateSpanInfo } = testConfig
    if (! validateSpanInfo) {
      console.warn('validateSpanInfo is false, skip test')
      return
    }

    const resp = await httpRequest.get(path)
    assert(resp.ok, resp.text)

    const traceId = resp.text
    assert(traceId.length === 32)

    const [info] = await retrieveTraceInfoFromRemote(traceId, 4)
    assert(info)
    // info.spans.forEach((span, idx) => {
    //   console.info(idx, { span })
    // })

    const [rootSpan, span1, span2, span3] = sortSpans(info.spans)
    assert(rootSpan)
    assert(span1)
    assert(span2)
    assert(span3)

    assertJaegerParentSpanArray([
      { parentSpan: rootSpan, childSpan: span1 },
      { parentSpan: span1, childSpan: span2 },
      { parentSpan: span1, childSpan: span3 },
    ])

    assertRootSpan({
      path,
      span: rootSpan,
      traceId,
      tags: {
        [SEMATTRS_HTTP_TARGET]: path,
        [SEMATTRS_HTTP_ROUTE]: path,
      },
    })

    const opt1: AssertsOptions = {
      traceId,
      operationName: 'SingletonService/hello',
      tags: {
        'caller.class': 'SingletonService',
        'caller.method': 'hello',
        'span.kind': 'client',
      },
    }
    assertsSpan(span1, opt1)

    const opt2: AssertsOptions = {
      traceId,
      operationName: 'SingletonService/helloAsync',
    }
    assertsSpan(span2, opt2)

    const opt3: AssertsOptions = {
      traceId,
      operationName: 'SingletonService/helloSync',
    }
    assertsSpan(span3, opt3)
  })
})

