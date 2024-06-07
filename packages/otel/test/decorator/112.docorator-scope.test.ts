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

  const path = `${apiBase.decorator_data}/${apiMethod.scope}`

  it(`Should ${path} work`, async () => {
    const { httpRequest, testSuffix } = testConfig

    const resp = await httpRequest.get(path)

    assert(resp.ok, resp.text)
    const traceId = resp.text
    assert(traceId)

    const [info] = await retrieveTraceInfoFromRemote(traceId, 8)
    assert(info)
    const { spans } = info
    const [rootSpan, span1, span2, span3, span4, span5, span6, span7] = sortSpans(spans)
    assert(rootSpan)
    assert(span1)
    assert(span2)
    assert(span3)
    assert(span4)
    assert(span5)
    assert(span6)
    assert(span7)

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
      operationName: 'DecoratorScopeComponentController/simple',
      tags: {
        'caller.class': 'DecoratorScopeComponentController',
        'caller.method': 'simple',
        'span.kind': 'client',
      },
    }
    assertsSpan(span1, opt1)

    const opt2: AssertsOptions = {
      traceId,
      operationName: 'DecoratorScopeComponentController/_simple1',
      tags: {
        'caller.class': 'DecoratorScopeComponentController',
        'caller.method': '_simple1',
        'span.kind': 'client',
      },
    }
    assertsSpan(span2, opt2)

    const opt3: AssertsOptions = {
      traceId,
      operationName: 'DecoratorScopeComponentController/_simple1a',
      tags: {
        'caller.class': 'DecoratorScopeComponentController',
        'caller.method': '_simple1a',
        'span.kind': 'client',
      },
    }
    assertsSpan(span3, opt3)

    assertsSpan(span4, opt2)
    assertsSpan(span5, opt3)

    const opt6: AssertsOptions = {
      traceId,
      operationName: 'DecoratorScopeComponentController/_simple2',
      tags: {
        'caller.class': 'DecoratorScopeComponentController',
        'caller.method': '_simple2',
        'span.kind': 'client',
      },
    }
    assertsSpan(span6, opt6)

    const opt7: AssertsOptions = {
      traceId,
      operationName: 'DecoratorScopeComponentController/_simple2a',
      tags: {
        'caller.class': 'DecoratorScopeComponentController',
        'caller.method': '_simple2a',
        'span.kind': 'client',
      },
    }
    assertsSpan(span7, opt7)
  })
})

