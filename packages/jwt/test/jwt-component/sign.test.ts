import assert from 'assert/strict'
import { relative } from 'path'

import {
  payload1,
  payload2,
  token1,
  tokenHeader2,
} from '@/mock-data'
import { testConfig } from '@/root.config'
import { jwtConfig } from '~/config/config.unittest'
import { JwtComponent } from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

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
      assert(token.indexOf(tokenHeader2) === 0)
    })
  })
})
