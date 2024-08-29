import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { jwtConfig } from '##/config/config.unittest.js'
import { JwtComponent } from '##/index.js'
import {
  payload1,


  signature1,
  token1,
} from '#@/mock-data.js'
import type { PayloadSig1, PayloadExt1 } from '#@/mock-data.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), () => {

  describe('Should Jwt:decode() work', () => {
    it('normal string', async () => {
      const { app } = testConfig
      const container = app.getApplicationContext()
      const svc = await container.getAsync(JwtComponent)

      const input = 'fooabc' + Math.random().toString()
      const token = svc.sign(input, jwtConfig.secret)
      const ret = svc.decode<string>(token)
      assert(ret.payload === input)
    })

    it('various generics types', async () => {
      const { app } = testConfig
      const container = app.getApplicationContext()
      const svc = await container.getAsync(JwtComponent)

      const token = svc.sign(payload1, jwtConfig.secret)

      const ret1 = svc.decode<PayloadSig1>(token) // index signature
      const ret2 = svc.decode<PayloadExt1>(token) // extends from
      const ret3 = svc.decode<typeof payload1>(token) // pick type
      const ret4 = svc.decode(token) // default json type

      assert.deepStrictEqual(ret1.payload, payload1)
      assert.deepStrictEqual(ret2.payload, payload1)
      assert.deepStrictEqual(ret3.payload, payload1)
      assert.deepStrictEqual(ret4.payload, payload1)
    })

    it('pass secret', async () => {
      const { app } = testConfig
      const container = app.getApplicationContext()
      const svc = await container.getAsync(JwtComponent)

      const token = svc.sign(payload1, jwtConfig.secret)
      const ret = svc.decode<PayloadSig1>(token)
      const { header, payload, signature } = ret

      assert(header && header.alg === 'HS256')
      assert(header.typ === 'JWT')
      assert(signature === signature1)
      assert.deepStrictEqual(payload, payload1)
    })

    it('with invalid scope', async () => {
      const { app } = testConfig
      const container = app.getApplicationContext()
      const svc = await container.getAsync(JwtComponent)

      // eslint-disable-next-line @typescript-eslint/unbound-method
      const { decode } = svc
      try {
        decode(token1)
      }
      catch (ex) {
        return assert(ex instanceof TypeError)
      }
      assert(false, 'Should throw error but NOT.')
    })
  })
})
