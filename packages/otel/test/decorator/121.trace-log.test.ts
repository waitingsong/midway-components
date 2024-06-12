import assert from 'node:assert/strict'

import { SEMATTRS_HTTP_TARGET, SEMATTRS_HTTP_ROUTE } from '@opentelemetry/semantic-conventions'
import { fileShortPath } from '@waiting/shared-core'

import {
  AssertsOptions, assertsSpan, assertRootSpan,
  retrieveTraceInfoFromRemote, sortSpans,
} from '##/index.js'
import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), function () {

  const path = `${apiBase.trace_log}/${apiMethod.error}`
  const path2 = `${apiBase.trace_log}/${apiMethod.error_no_capture}`

  it(`Should ${path} work`, async () => {
    const { httpRequest, testSuffix } = testConfig

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

    const foo = 'foo'
    const bar = 'bar'
    const instanceName = 'TraceLogComponentController'
    const methodName1 = '_simple1'
    const methodName2 = '_simple2'

    const opt1: AssertsOptions = {
      traceId,
      operationName: 'TraceLogComponentController/error',
      tags: {
        args0: foo,
        'caller.class': 'TraceLogComponentController',
        'caller.method': 'error',
        'span.kind': 'client',
      },
      logs: [
        { event: 'before', args0: foo, instanceName, methodName: methodName1 },
        { event: 'exception', 'exception.message': 'foo-error' },

        { event: 'before', args0: bar, instanceName, methodName: methodName2 },
        { event: 'exception', 'exception.message': 'bar-error' },
      ],
    }
    assertsSpan(span1, opt1)
  })

  it(`Should ${path2} work`, async () => {
    const { httpRequest, testSuffix } = testConfig

    const resp = await httpRequest.get(path2)
    assert(! resp.ok, resp.text)
    // check span manually
  })
})


