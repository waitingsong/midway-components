import assert from 'node:assert/strict'

import { SEMATTRS_HTTP_TARGET, SEMATTRS_HTTP_ROUTE } from '@opentelemetry/semantic-conventions'
import { fileShortPath } from '@waiting/shared-core'

import { exporterEndpoint } from '##/lib/config.js'
import { apiBase, apiMethod } from '#@/api-test.js'
import { retrieveTraceInfoFromRemote, sortSpans } from '#@/helper.test.js'
import { AssertsOptions, assertsSpan, assertRootSpan } from '#@/lib/110.helper.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), function () {
  this.retries(1)

  const path = `${apiBase.TraceDecorator}/${apiMethod.id}`
  const path2 = `${apiBase.TraceDecorator}/${apiMethod.id2}`
  const path3 = `${apiBase.TraceDecorator}/${apiMethod.decorator_arg}`
  const path4 = `${apiBase.TraceDecorator}/${apiMethod.decorator_arg2}`

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
  })


  it(`Should ${path2} work`, async () => {
    const { httpRequest, validateSpanInfo } = testConfig
    if (! validateSpanInfo) {
      console.warn('validateSpanInfo is false, skip test')
      return
    }

    const resp = await httpRequest.get(path2)
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
      path: path2,
      span: rootSpan,
      traceId,
      tags: {
        [SEMATTRS_HTTP_TARGET]: path2,
        [SEMATTRS_HTTP_ROUTE]: path2,
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


  it(`Should ${path3} work`, async () => {
    const { httpRequest, validateSpanInfo } = testConfig
    if (! validateSpanInfo) {
      console.warn('validateSpanInfo is false, skip test')
      return
    }

    const resp = await httpRequest.get(path3)
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

    assertRootSpan({
      path,
      span: rootSpan,
      traceId,
      operationName: `HTTP GET ${path3}`,
      tags: {
        [SEMATTRS_HTTP_TARGET]: path3,
        [SEMATTRS_HTTP_ROUTE]: path3,
      },
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
    assertsSpan(span1, opt1)

    const opt2: AssertsOptions = {
      traceId,
      operationName: `foo-${rnd}`,
      tags: {
        'caller.class': 'DefaultComponentService',
        'caller.method': 'testArg',
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

  it(`Should ${path4} work`, async () => {
    const { httpRequest, validateSpanInfo } = testConfig
    if (! validateSpanInfo) {
      console.warn('validateSpanInfo is false, skip test')
      return
    }

    const resp = await httpRequest.get(path4)
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

    assertRootSpan({
      path: path4,
      span: rootSpan,
      traceId,
      operationName: `HTTP GET ${path4}`,
      tags: {
        [SEMATTRS_HTTP_TARGET]: path4,
        [SEMATTRS_HTTP_ROUTE]: path4,
      },
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
    assertsSpan(span1, opt1)

    const opt2: AssertsOptions = {
      traceId,
      operationName: opName,
      tags: {
        'caller.class': 'DefaultComponentService',
        'caller.method': 'testArg2',
        'span.kind': 'client',
      },
    }
    assertsSpan(span2, opt2)
  })

})

