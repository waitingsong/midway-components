import assert from 'node:assert/strict'

import { SEMATTRS_HTTP_TARGET, SEMATTRS_HTTP_ROUTE } from '@opentelemetry/semantic-conventions'
import { fileShortPath } from '@waiting/shared-core'

import { apiBase, apiMethod } from '#@/api-test.js'
import { retrieveTraceInfoFromRemote, sortSpans } from '#@/helper.test.js'
import { testConfig } from '#@/root.config.js'

import { AssertsOptions, assertRootSpan, assertsSpan } from './110.helper.js'


describe(fileShortPath(import.meta.url), function () {

  const path1 = `${apiBase.decoratorData}/${apiMethod.mixOnAsync}`
  const path2 = `${apiBase.decoratorData}/${apiMethod.mixOnSync}`

  it(`Should ${path1} work`, async () => {
    const { httpRequest, testSuffix } = testConfig

    const id = Math.random().toString(36).slice(2)
    const resp = await httpRequest.get(`${path1}/${id}`)

    assert(resp.ok, resp.text)
    const ret = resp.text
    assert(ret)
    const [traceId, rnd] = ret.split(':')
    assert(traceId, ret)
    assert(rnd === id, ret)

    const [info] = await retrieveTraceInfoFromRemote(traceId, 3)
    assert(info)
    console.log('--------------------', { info })
    const { spans } = info
    assert(spans.length)
    spans.forEach((span, idx) => {
      console.info(idx, { span })
    })

    const [rootSpan, span1, span2] = sortSpans(spans)
    assert(rootSpan)
    assert(span2)
    assert(span1)

    assertRootSpan({
      path: path1,
      span: rootSpan,
      traceId,
      operationName: `HTTP GET ${path1}/:id`,
      tags: {
        [SEMATTRS_HTTP_TARGET]: `${path1}/${id}`,
        [SEMATTRS_HTTP_ROUTE]: `${path1}/:id`,
        rootAttrs: 'rootAttrs',
      },
      logs: [
        { event: 'default', rootAttrs: 'rootAttrs' },
      ],
    })

    const opt1: AssertsOptions = {
      traceId,
      operationName: 'DecoratorDataComponentController/mixOnAsync',
      tags: {
        args0: id,
        'caller.class': 'DecoratorDataComponentController',
        'caller.method': 'mixOnAsync',
        'span.kind': 'client',
      },
    }
    assertsSpan(span1, opt1)

    const opt2: AssertsOptions = {
      traceId,
      operationName: 'DecoratorDataComponentController/_mixOnAsync',
      tags: {
        'caller.class': 'DecoratorDataComponentController',
        'caller.method': '_mixOnAsync',
        'span.kind': 'client',
        args0: id,
      },
      logs: [
        { event: 'before', args0: id },
        { event: 'after', args0: id, res: `${id}${testSuffix}` },
      ],
    }
    assertsSpan(span2, opt2)
  })


  it(`Should ${path2} return error`, async () => {
    const { httpRequest, testSuffix } = testConfig

    const id = Math.random().toString(36).slice(2)
    const resp = await httpRequest.get(`${path2}/${id}`)

    assert(! resp.ok, resp.text)
    assert(resp.status === 500)
    assert(resp.text.includes('decorator before() return value is a promise'), resp.text)
    assert(resp.text.includes('class: DecoratorDataComponentController'), resp.text)
    assert(resp.text.includes('method: _MixOnSync'), resp.text)
  })
})


