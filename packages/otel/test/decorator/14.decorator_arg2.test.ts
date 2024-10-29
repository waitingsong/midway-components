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
  this.retries(2)

  const path = `${apiBase.TraceDecorator}/${apiMethod.decorator_arg2}`

  it(`Should ${path} work`, async () => {
    const { httpRequest, validateSpanInfo } = testConfig
    if (! validateSpanInfo) {
      console.warn('validateSpanInfo is false, skip test')
      return
    }

    const resp = await httpRequest.get(path)
    assert(resp.ok, resp.text)

    const [traceId, rnd, suffix] = resp.text.split(':')
    assert(traceId)
    assert(traceId.length === 32)
    assert(rnd)
    assert(typeof suffix === 'string')
    console.log({ traceId, rnd, suffix })
    const int = parseInt(rnd, 10)
    const opName = `foo-${int + 1}-${suffix}`

    const [info] = await retrieveTraceInfoFromRemote(traceId, 3)
    assert(info)

    const [rootSpan, span1, span2] = sortSpans(info.spans)
    assert(rootSpan)
    assert(span1)
    assert(span2)

    assertJaegerParentSpanArray([
      { parentSpan: rootSpan, childSpan: span1 },
      { parentSpan: span1, childSpan: span2 },
    ])

    assertRootSpan({
      path,
      span: rootSpan,
      traceId,
      operationName: `HTTP GET ${path}`,
      tags: {
        [SEMATTRS_HTTP_TARGET]: path,
        [SEMATTRS_HTTP_ROUTE]: path,
      },
      mergeDefaultLogs: false,
    })

    const opt1: AssertsOptions = {
      traceId,
      operationName: 'DefaultComponentController/arg2',
      tags: {
        'caller.class': 'DefaultComponentController',
        'caller.method': 'arg2',
        'span.kind': 'client',
      },
    }
    try {
      assertsSpan(span1, opt1)
    }
    catch (ex) {
      console.error({ rootSpan, span1, span2 })
      throw ex
    }

    const opt2: AssertsOptions = {
      traceId,
      operationName: opName,
      tags: {
        'caller.class': 'DefaultComponentService',
        'caller.method': 'testArg2',
        'span.kind': 'client',
      },
    }
    try {
      assertsSpan(span2, opt2)
    }
    catch (ex) {
      console.error({ rootSpan, span1, span2 })
      throw ex
    }
  })

})

