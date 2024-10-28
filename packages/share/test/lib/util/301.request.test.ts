import assert from 'node:assert'

import { fileShortPath } from '@waiting/shared-core'

import { type Context, type GrpcContext, retrieveRequestProtocolFromCtx } from '##/index.js'


describe(fileShortPath(import.meta.url), function () {
  describe(`retrieveRequestProtocolFromCtx()`, async () => {
    it(`http`, async () => {
      const protocol = retrieveRequestProtocolFromCtx({
        request: {
          protocol: 'http',
        },
      } as Context)

      assert(protocol === 'http')
    })

    it(`grpc`, async () => {
      const protocol = retrieveRequestProtocolFromCtx({
        call: {},
        writable: true,
      } as GrpcContext)

      assert(protocol === 'grpc')
    })

    it(`empty`, async () => {
      const protocol = retrieveRequestProtocolFromCtx({ } as GrpcContext)
      assert(protocol === '')
    })
  })

})


