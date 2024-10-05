import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { retrieveTraceInfoFromRemote, retrieveTraceparentFromHeader } from '##/index.js'
import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), function () {
  describe('retrieveTraceInfoFromRemote()', () => {
    const path = `${apiBase.util}/${apiMethod.propagateHeader}`

    it('common', async () => {
      const { httpRequest } = testConfig

      const resp = await httpRequest.get(path)
      assert(resp.ok, resp.text)
      assert(resp.text === 'OK')

      const traceparent = retrieveTraceparentFromHeader(resp.headers as Headers)
      assert(traceparent)
      const txt = `${traceparent.version}-${traceparent.traceId}-${traceparent.parentId}-${traceparent.traceFlags}`
      const info = await retrieveTraceInfoFromRemote(txt)
      assert(info)
    })

  })
})

