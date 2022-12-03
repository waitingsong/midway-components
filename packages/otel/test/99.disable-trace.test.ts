import assert from 'node:assert/strict'
import { relative } from 'node:path'

import { makeHttpRequest } from '@midwayjs/core'
import { sleep } from '@waiting/shared-core'

import { testConfig } from '@/root.config'
import { exporterEndpoint } from '~/lib/config'
import { Config, JaegerTraceInfo, JaegerTraceInfoSpan } from '~/lib/types'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')
const agent = exporterEndpoint.replace(/:\d+$/u, '')
assert(agent, 'OTEL_EXPORTER_OTLP_ENDPOINT not set')

describe(filename, () => {

  before(() => {
    const { app } = testConfig
    const otelConfig: Partial<Config> = { enable: false }
    app.addConfigObject({ otelConfig })
  })

  after(() => {
    const { app } = testConfig
    const otelConfig: Partial<Config> = { enable: true }
    app.addConfigObject({ otelConfig })
  })

  const path = '/_otel/disable_trace'

  it(`Should ${path} work`, async () => {
    const { httpRequest } = testConfig

    const resp = await httpRequest
      .get(path)
      .expect(200)

    const traceId = resp.text as string
    assert(! traceId, 'traceId should be empty')
  })

})
