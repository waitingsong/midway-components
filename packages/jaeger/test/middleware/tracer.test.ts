import assert from 'assert/strict'
import { relative } from 'path'

import { testConfig, TestRespBody } from '@/root.config'
import { HeadersKey, TestSpanInfo, TracerLog } from '~/lib/types'
import { getComponentConfig } from '~/util/common'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  it('Should work', async () => {
    const { app, httpRequest } = testConfig

    const path = '/'
    const tracerConfig = getComponentConfig(app)

    assert(tracerConfig)
    const { sampler } = tracerConfig.tracingConfig
    assert(sampler)

    const resp = await httpRequest
      .get(path)
      .expect(200)
    const { spanInfo } = resp.body as TestRespBody
    assertSpanInfo(spanInfo)

    // const expectTags = [
    //   {
    //     key: 'sampler.type',
    //     value: sampler ? sampler.type : 'fake', // 'probabilistic',
    //   },
    //   {
    //     key: 'sampler.param',
    //     value: sampler ? sampler.param : 'fake', // 1,
    //   },
    // ]
    // assert.deepStrictEqual(spanInfo.tags, expectTags)
  })

  it.only('Should work with parent span', async () => {
    const { httpRequest } = testConfig

    const path = '/'
    const parentSpanId = Math.random().toString().slice(2)
    const sendHeader = {
      [HeadersKey.traceId]: `${parentSpanId}:${parentSpanId}:0:1`,
    }
    const resp = await httpRequest
      .get(path)
      .set(sendHeader)
      .expect(200)
    const { spanInfo } = resp.body as TestRespBody
    assertSpanInfo(spanInfo)

    console.log({ tags: spanInfo.tags })
    assert(spanInfo.tags.length === 3)

    const { headerInit } = spanInfo
    assert(headerInit)
    if (headerInit) {
      const header = headerInit[HeadersKey.traceId]
      const expectParentSpanId = header.slice(0, header.indexOf(':'))
      assert(expectParentSpanId === parentSpanId)
    }
  })

  it('Should work if path match whitelist string', async () => {
    const { httpRequest } = testConfig

    const path = '/untraced_path_string'
    const resp = await httpRequest
      .get(path)
      .expect(200)
    assert(resp.body === false)
  })

  it('Should work if path match whitelist regexp', async () => {
    const { httpRequest } = testConfig

    const path = '/untraced_path_reg_exp'
    const resp = await httpRequest
      .get(path)
      .expect(200)
    assert(resp.body === false)
  })
})


function assertSpanInfo(spanInfo: TestSpanInfo): void {
  assert(spanInfo)
  const { startTime, logs, tags, isTraceEnabled } = spanInfo

  assert(isTraceEnabled === true)
  assert(typeof startTime === 'number')
  assert(startTime > 0)
  assert(Array.isArray(logs) && logs.length > 0)
  assert(Array.isArray(tags))

  const [log0] = logs
  assert(log0)
  if (log0) {
    assert(log0.timestamp > 0)
    const { fields } = log0
    assert(Array.isArray(fields))
    const [row0] = fields
    assert(row0)
    if (row0) {
      assert(row0.key === 'event')
      assert(row0.value === TracerLog.requestBegin)
    }
  }
}
