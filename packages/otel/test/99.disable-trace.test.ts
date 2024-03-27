import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { exporterEndpoint } from '##/lib/config.js'
import { Config } from '##/lib/types.js'
import { apiPrefix, apiRoute } from '#@/fixtures/base-app/src/api-route.js'
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

  const path = `${apiPrefix.TraceDecorator}/${apiRoute.disable_trace}`

  it(`Should ${path} work`, async () => {
    const { httpRequest } = testConfig

    const resp = await httpRequest
      .get(path)
      .expect(200)

    const traceId = resp.text
    assert(! traceId, 'traceId should be empty')
  })

})
