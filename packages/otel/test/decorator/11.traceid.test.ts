import assert from 'node:assert/strict'

import { SEMATTRS_HTTP_ROUTE, SEMATTRS_HTTP_TARGET } from '@opentelemetry/semantic-conventions'
import { fileShortPath } from '@waiting/shared-core'

import {
  AttrNames,
  assertRootSpan,
  assertsSpan,
  retrieveTraceInfoFromRemote, sortSpans,
} from '##/index.js'
import type { AssertsOptions } from '##/index.js'
import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), function () {
  this.retries(2)

  const path = `${apiBase.TraceDecorator}/${apiMethod.id}`

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
    console.log({ traceId })

    const [info] = await retrieveTraceInfoFromRemote(traceId, 2)
    assert(info)
    // info.spans.forEach((span, idx) => {
    //   console.info(idx, { span })
    // })

    const [rootSpan, span1] = sortSpans(info.spans)
    assert(rootSpan)
    assert(span1)

    assertRootSpan({
      path,
      span: rootSpan,
      traceId,
      tags: {
        [SEMATTRS_HTTP_TARGET]: path,
        [SEMATTRS_HTTP_ROUTE]: path,
      },
      mergeDefaultLogs: false,
      logs: [
        { event: AttrNames.RequestBegin },
        { event: AttrNames.PreProcessFinish },
        { event: AttrNames.PostProcessBegin },
        { event: AttrNames.Outgoing_Response_data, [AttrNames.Http_Response_Code]: 200 },
        { event: AttrNames.RequestEnd },
      ],
    })

    const opt1: AssertsOptions = {
      traceId,
      operationName: 'DefaultComponentService/hello',
      tags: {
        'caller.class': 'DefaultComponentService',
        'caller.method': 'hello',
        'span.kind': 'client',
      },
    }
    assertsSpan(span1, opt1)

    await Promise.all([
      httpRequest.get(path),
      httpRequest.get(path),
      httpRequest.get(path),
    ])
  })
})

