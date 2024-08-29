import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { jwtConfig } from '##/config/config.unittest.js'
import { JwtComponent } from '##/index.js'
import {
  payload1,
  payload2,
  token1,
  tokenHeader2,
} from '#@/mock-data.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), () => {

  describe('Should Jwt:sign() work', () => {

    it('initializ secret', async () => {
      const { app } = testConfig
      const container = app.getApplicationContext()
      const svc = await container.getAsync(JwtComponent)

      const token = svc.sign(payload1)
      assert(token === token1)
    })

    it('pass secret', async () => {
      const { app } = testConfig
      const container = app.getApplicationContext()
      const svc = await container.getAsync(JwtComponent)

      const token = svc.sign(payload1, jwtConfig.secret)
      assert(token === token1)
    })

    it('without iat', async () => {
      const { app } = testConfig
      const container = app.getApplicationContext()
      const svc = await container.getAsync(JwtComponent)

      const token = svc.sign(payload2)
      assert(token.startsWith(tokenHeader2))
    })
  })
})
