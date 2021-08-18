import { relative } from 'path'

import { testConfig } from '../root.config'
import {
  payload1,
  payload2,
  secret,
  token1,
  tokenHeader2,
} from '../test.config'

import { JwtComponent, JwtConfig } from '~/index'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('Should Jwt:sign() work', () => {

    it('initializ secret', async () => {
      const { app } = testConfig
      const jwtConfig: JwtConfig = {
        secret,
      }
      app.addConfigObject({ jwtConfig })
      const container = app.getApplicationContext()
      const svc = await container.getAsync(JwtComponent)

      const token = svc.sign(payload1)
      assert(token === token1)
    })

    it('pass secret', async () => {
      const { app } = testConfig
      const jwtConfig: JwtConfig = {
        secret,
      }
      app.addConfigObject({ jwtConfig })
      const container = app.getApplicationContext()
      const svc = await container.getAsync(JwtComponent)

      const token = svc.sign(payload1, secret)
      assert(token === token1)
    })

    it('without iat', async () => {
      const { app } = testConfig
      const jwtConfig: JwtConfig = {
        secret,
      }
      app.addConfigObject({ jwtConfig })
      const container = app.getApplicationContext()
      const svc = await container.getAsync(JwtComponent)

      const token = svc.sign(payload2)
      assert(token.indexOf(tokenHeader2) === 0)
    })
  })
})
