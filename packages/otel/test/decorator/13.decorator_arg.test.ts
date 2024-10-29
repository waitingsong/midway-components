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
  this.retries(3)

  const path = `${apiBase.TraceDecorator}/${apiMethod.decorator_arg}`

  it(`Should ${path} work`, async () => {
    const { httpRequest, validateSpanInfo } = testConfig
    if (! validateSpanInfo) {
      console.warn('validateSpanInfo is false, skip test')
      return
    }

    const resp = await httpRequest.get(path)
    assert(resp.ok, resp.text)

    const [traceId, rnd] = resp.text.split(':')
    assert(traceId)
    assert(traceId.length === 32)
    assert(rnd)
    console.log({ traceId, rnd })

    const [info] = await retrieveTraceInfoFromRemote(traceId, 4)
    assert(info)

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
      operationName: `HTTP GET ${path}`,
      tags: {
        [SEMATTRS_HTTP_TARGET]: path,
        [SEMATTRS_HTTP_ROUTE]: path,
      },
      mergeDefaultLogs: false,
    })

    const opt1: AssertsOptions = {
      traceId,
      operationName: 'DefaultComponentController/arg',
      tags: {
        'caller.class': 'DefaultComponentController',
        'caller.method': 'arg',
        'span.kind': 'client',
      },
    }
    try {
      assertsSpan(span1, opt1)
    }
    catch (ex) {
      console.error({ rootSpan, span1, span2, span3 })
      throw ex
    }

    const opt2: AssertsOptions = {
      traceId,
      operationName: `foo-${rnd}`,
      tags: {
        'caller.class': 'DefaultComponentService',
        'caller.method': 'testArg',
        'span.kind': 'client',
      },
    }
    try {
      assertsSpan(span2, opt2)
    }
    catch (ex) {
      console.error({ rootSpan, span1, span2, span3 })
      throw ex
    }

    const opt3: AssertsOptions = {
      traceId,
      operationName: 'DefaultComponentService/helloSync',
      tags: {
        'caller.class': 'DefaultComponentService',
        'caller.method': 'helloSync',
        'span.kind': 'client',
      },
    }
    try {
      assertsSpan(span3, opt3)
    }
    catch (ex) {
      console.error({ rootSpan, span1, span2, span3 })
      throw ex
    }

    console.info({ rootSpan, span1, span2, span3 })
  })

})

