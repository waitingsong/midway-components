import assert from 'node:assert/strict'

import { SEMATTRS_HTTP_TARGET, SEMATTRS_HTTP_ROUTE } from '@opentelemetry/semantic-conventions'
import { fileShortPath } from '@waiting/shared-core'

import { exporterEndpoint } from '##/lib/config.js'
import { apiBase, apiMethod } from '#@/api-test.js'
import { retrieveTraceInfoFromRemote, sortSpans } from '#@/helper.test.js'
import { AssertsOptions, assertsSpan, assertRootSpan } from '#@/lib/110.helper.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), function () {
  this.retries(3)

  const path = `${apiBase.TraceDecorator}/${apiMethod.id2}`

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
      operationName: 'DefaultComponentController/traceId2',
      tags: {
        'caller.class': 'DefaultComponentController',
        'caller.method': 'traceId2',
        'span.kind': 'client',
      },
    }
    assertsSpan(span1, opt1)

    const opt2: AssertsOptions = {
      traceId,
      operationName: 'DefaultComponentService/hello',
      tags: {
        'caller.class': 'DefaultComponentService',
        'caller.method': 'hello',
        'span.kind': 'client',
      },
    }
    assertsSpan(span2, opt2)

    const opt3: AssertsOptions = {
      traceId,
      operationName: 'DefaultComponentService/helloSync',
      tags: {
        'caller.class': 'DefaultComponentService',
        'caller.method': 'helloSync',
        'span.kind': 'client',
      },
    }
    assertsSpan(span3, opt3)
  })
})

