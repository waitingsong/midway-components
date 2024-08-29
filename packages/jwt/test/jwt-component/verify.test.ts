import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { JwtComponent } from '##/index.js'
import type { Config } from '##/lib/types.js'
import {
  payload1,
  token1,
} from '#@/mock-data.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), () => {

  const secret = '123456abc'

  describe('Should Jwt:verify() work', () => {
    it('initializ secret', async () => {
      const { app } = testConfig
      const container = app.getApplicationContext()
      const svc = await container.getAsync(JwtComponent)

      const token = svc.sign(payload1)
      const ret = svc.verify(token)
      assert.deepStrictEqual(ret.payload, payload1)
    })

    it('pass secret', async () => {
      const { app } = testConfig
      const jwtConfig: Config = {
        secret: '',
      }
      app.addConfigObject({ jwtConfig })
      const container = app.getApplicationContext()
      const svc = await container.getAsync(JwtComponent)

      const token = svc.sign(payload1, secret)
      const ret = svc.verify(token, secret)
      assert.deepStrictEqual(ret.payload, payload1)
    })

    it('without verify secret (using signing secret)', async () => {
      const { app } = testConfig
      const jwtConfig: Config = {
        secret: 'not-used',
      }
      app.addConfigObject({ jwtConfig })
      const container = app.getApplicationContext()
      const svc = await container.getAsync(JwtComponent)

      const token = svc.sign(payload1, jwtConfig.secret)
      const ret = svc.verify(token)
      assert.deepStrictEqual(ret.payload, payload1)
    })

    it('both initializing and passing secret', async () => {
      const { app } = testConfig
      const jwtConfig: Config = {
        secret: 'not used',
      }
      app.addConfigObject({ jwtConfig })
      const container = app.getApplicationContext()
      const svc = await container.getAsync(JwtComponent)

      const token = svc.sign(payload1, secret)
      const ret = svc.verify(token, secret)
      assert.deepStrictEqual(ret.payload, payload1)
    })

    it('with invalid scope', async () => {
      const { app } = testConfig
      const container = app.getApplicationContext()
      const svc = await container.getAsync(JwtComponent)

      // eslint-disable-next-line @typescript-eslint/unbound-method
      const { verify } = svc
      try {
        verify(token1)
      }
      catch (ex) {
        return assert(ex instanceof TypeError)
      }
      assert(false, 'Should throw error but not.')
    })
  })
})
