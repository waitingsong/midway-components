import assert from 'node:assert/strict'

import { SEMATTRS_HTTP_ROUTE, SEMATTRS_HTTP_TARGET } from '@opentelemetry/semantic-conventions'
import { fileShortPath } from '@waiting/shared-core'

import {
  assertRootSpan,
  assertsSpan,
  retrieveTraceInfoFromRemote, sortSpans,
} from '##/index.js'
import type { AssertsOptions } from '##/index.js'
import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), function () {

  const path = `${apiBase.trace_log}/${apiMethod.mix}`

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
        false,
        {},
        { event: 'default', rootAttrs: 'rootAttrs' },
        false,
        false,
        false,
      ],
    })

    const foo = 'foo'
    const bar = 'bar'
    const instanceName = 'TraceLogMixController'
    const methodName1 = '_simple1'
    const methodName2 = '_simple2'

    const opt1: AssertsOptions = {
      traceId,
      operationName: 'TraceLogMixController/hello',
      tags: {
        args0: foo,
        'caller.class': 'TraceLogMixController',
        'caller.method': 'hello',
        'span.kind': 'client',
      },
      logs: [
        { event: 'before', args0: foo, instanceName, methodName: methodName1 },
        { event: 'after', args0: foo, instanceName, methodName: methodName1, res: foo },

        { event: 'before', args0: bar, instanceName, methodName: methodName2 },
        { event: 'after', args0: bar, instanceName, methodName: methodName2, res: bar },
      ],
    }
    assertsSpan(span1, opt1)
  })
})


