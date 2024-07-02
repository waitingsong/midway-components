import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { exporterEndpoint } from '##/lib/config.js'
import type { Config } from '##/lib/types.js'
import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


const agent = exporterEndpoint.replace(/:\d+$/u, '')
assert(agent, 'OTEL_EXPORTER_OTLP_ENDPOINT not set')

describe(fileShortPath(import.meta.url), function () {

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

  const path = `${apiBase.TraceDecorator}/${apiMethod.disable_trace}`

  it(`Should ${path} work`, async () => {
    const { httpRequest } = testConfig

    const resp = await httpRequest.get(path)
    assert(resp.ok, resp.text)

    const traceId = resp.text
    assert(! traceId, 'traceId should empty')
  })

})
