import assert from 'node:assert/strict'

import { SEMATTRS_HTTP_METHOD, SEMATTRS_HTTP_ROUTE, SEMATTRS_HTTP_TARGET } from '@opentelemetry/semantic-conventions'
import { fileShortPath } from '@waiting/shared-core'

import {
  AssertsOptions,
  AttrNames, assertRootSpan, assertsSpan,
  retrieveTraceInfoFromRemote, sortSpans,
} from '##/index.js'
import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), function () {

  const path = `${apiBase.util}/${apiMethod.hello}`

  it(`Should GET ${path} work`, async () => {
    const { httpRequest, testSuffix } = testConfig

    const resp = await httpRequest.get(`${path}?foo=1`)

    assert(resp.ok, resp.text)
    const traceId = resp.text
    assert(traceId)

    const [info] = await retrieveTraceInfoFromRemote(traceId, 3)
    assert(info)
    const { spans } = info
    const [rootSpan, span1] = sortSpans(spans)
    assert(rootSpan)
    assert(span1)

    assert(rootSpan.spanID === span1.references[0]?.spanID)

    assertRootSpan({
      path,
      span: rootSpan,
      traceId,
      operationName: `HTTP GET ${path}`,
      tags: {
        [SEMATTRS_HTTP_TARGET]: `${path}`,
        [SEMATTRS_HTTP_ROUTE]: `${path}`,
      },
      logs: [
        {},
        {
          [AttrNames.Http_Request_Query]: JSON.stringify({ foo: '1' }, null, 2),
        },
        {},
        {},
        {},
      ],
    })
  })

  it(`Should POST ${path} work`, async () => {
    const { httpRequest, testSuffix } = testConfig

    const resp = await httpRequest
      .post(path)
      .send({ foo: '1' })

    assert(resp.ok, resp.text)
    const traceId = resp.text
    assert(traceId)

    const [info] = await retrieveTraceInfoFromRemote(traceId, 3)
    assert(info)
    const { spans } = info
    const [rootSpan, span1] = sortSpans(spans)
    assert(rootSpan)
    assert(span1)

    assert(rootSpan.spanID === span1.references[0]?.spanID)

    assertRootSpan({
      path,
      span: rootSpan,
      traceId,
      operationName: `HTTP POST ${path}`,
      tags: {
        [SEMATTRS_HTTP_TARGET]: `${path}`,
        [SEMATTRS_HTTP_ROUTE]: `${path}`,
      },
      logs: [
        {},
        {
          [AttrNames.Http_Request_Body]: JSON.stringify({ foo: '1' }, null, 2),
        },
        {},
        {},
        {},
      ],
    })

  })
})


