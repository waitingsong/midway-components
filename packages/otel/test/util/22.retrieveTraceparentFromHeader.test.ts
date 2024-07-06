import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import type { Traceparent } from '##/index.js'
import { retrieveTraceparentFromHeader } from '##/index.js'


describe(fileShortPath(import.meta.url), function () {
  describe('retrieveTraceparentFromHeader()', () => {
    const ver = '00'
    const id = '0af7651916cd43dd8448eb211c80319c'
    const pid = 'b7ad6b7169203331'
    const flag = '01'

    it('falsy', async () => {
      const headers = new Headers()
      const traceparent = retrieveTraceparentFromHeader(headers)
      assert(! traceparent)
    })

    it('headers', async () => {
      const headers = new Headers()

      headers.set('traceparent', `${ver}-${id}-${pid}-${flag}`)
      const traceparent = retrieveTraceparentFromHeader(headers)
      assert(traceparent)
      assert(traceparent.version === ver)
      assert(traceparent.traceId === id)
      assert(traceparent.parentId === pid)
      assert(traceparent.traceFlags === flag)
    })

    it('object', async () => {
      const headers = {
        traceparent: `${ver}-${id}-${pid}-${flag}`,
      }
      const traceparent = retrieveTraceparentFromHeader(headers)
      assert(traceparent)
      assert(traceparent.version === ver)
      assert(traceparent.traceId === id)
      assert(traceparent.parentId === pid)
      assert(traceparent.traceFlags === flag)
    })

  })
})

