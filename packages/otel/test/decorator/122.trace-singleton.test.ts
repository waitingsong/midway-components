import assert from 'node:assert/strict'

import { SEMATTRS_HTTP_TARGET, SEMATTRS_HTTP_ROUTE } from '@opentelemetry/semantic-conventions'
import { fileShortPath } from '@waiting/shared-core'

import {
  assertsSpan, assertRootSpan,
  retrieveTraceInfoFromRemote, sortSpans,
} from '##/index.js'
import type { AssertsOptions } from '##/index.js'
import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), function () {

  const path1 = `${apiBase.trace_singleton}/${apiMethod.hello}`
  const path2 = `${apiBase.trace_singleton}/${apiMethod.home}`

  it(`Should ${path1} work`, async () => {
    const { httpRequest, testSuffix } = testConfig
    const path = path1

    const resp = await httpRequest.get(path)
    assert(resp.ok, resp.text)
    const traceId = resp.text
    assert(traceId)

    const [info] = await retrieveTraceInfoFromRemote(traceId, 2)
    assert(info)
    const { spans } = info
    const [rootSpan, span1] = sortSpans(spans)
    assert(rootSpan)
    assert(span1)

    assertRootSpan({
      path,
      span: rootSpan,
      traceId,
      operationName: `HTTP GET ${path}`,
      tags: {
        [SEMATTRS_HTTP_TARGET]: `${path}`,
        [SEMATTRS_HTTP_ROUTE]: `${path}`,
      },
    })

    const opt1: AssertsOptions = {
      traceId,
      operationName: 'TraceController/hello',
    }
    assertsSpan(span1, opt1)
  })

  it(`Should ${path2} work`, async () => {
    const { httpRequest, testSuffix } = testConfig
    const path = path2

    const resp = await httpRequest.get(path)
    assert(resp.ok, resp.text)
    const traceId = resp.text
    assert(traceId)

    const [info] = await retrieveTraceInfoFromRemote(traceId, 2)
    assert(info)
    const { spans } = info
    const [rootSpan, span1] = sortSpans(spans)
    assert(rootSpan)
    assert(span1)

    assertRootSpan({
      path,
      span: rootSpan,
      traceId,
      operationName: `HTTP GET ${path}`,
      tags: {
        [SEMATTRS_HTTP_TARGET]: `${path}`,
        [SEMATTRS_HTTP_ROUTE]: `${path}`,
      },
    })

    const opt1: AssertsOptions = {
      traceId,
      operationName: 'TraceController/home',
    }
    assertsSpan(span1, opt1)
  })

})


