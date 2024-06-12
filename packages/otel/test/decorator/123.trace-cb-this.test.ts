import assert from 'node:assert/strict'

import { SEMATTRS_HTTP_TARGET, SEMATTRS_HTTP_ROUTE } from '@opentelemetry/semantic-conventions'
import { fileShortPath } from '@waiting/shared-core'

import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'
import {
  AssertsOptions, assertsSpan, assertRootSpan,
  retrieveTraceInfoFromRemote, sortSpans,
} from '#@/test.helper.js'


describe(fileShortPath(import.meta.url), function () {

  const path1 = `${apiBase.trace_this}/${apiMethod.home}`
  const path2 = `${apiBase.trace_this}/${apiMethod.hello}`

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
      operationName: 'TraceThisController/home',
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
      operationName: 'TraceThisController/hello',
    }
    assertsSpan(span1, opt1)
  })

})


