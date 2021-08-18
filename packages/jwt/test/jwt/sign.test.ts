import { relative } from 'path'

import { testConfig } from '../test-config'

import { payload1, payload2, secret, token1, tokenHeader2 } from './test.config'

import { Jwt } from '~/index'
import { Application } from '~/interface'


// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = relative(process.cwd(), __filename)


describe(filename, () => {

  describe('Should Jwt:sign() works', () => {
    it('initializ secret', async () => {
      const jwt = new Jwt()

      const token = jwt.sign(payload1)
      assert(token === token1)
    })

    it('pass secret', async () => {
      const { app } = testConfig
      const container = app.getApplicationContext()
      const jwt = await container.getAsync(Jwt)

      const token = jwt.sign(payload1, secret)
      assert(token === token1)
    })

    // it('both initializing and passing secret', async () => {
    //   const opts: ClientOptions = {
    //     ...initialClientOptions,
    //     secret: 'notused',
    //   }
    //   const jwt = new Jwt(opts)
    //   const token = jwt.sign(payload1, secret)

    //   assert(token === token1)
    // })

    it('without iat', async () => {
      const { app } = testConfig
      const container = app.getApplicationContext()
      const jwt = await container.getAsync(Jwt)

      const token = jwt.sign(payload2)

      assert(token.indexOf(tokenHeader2) === 0)
    })

    it('with invalid scope', async () => {
      const { app } = testConfig
      const container = app.getApplicationContext()
      const jwt = await container.getAsync(Jwt)

      // eslint-disable-next-line @typescript-eslint/unbound-method
      const { sign } = jwt

      try {
        sign(payload2)
      }
      catch (ex) {
        return assert(ex instanceof TypeError)
      }
      assert(false, 'Should throw error but not.')
    })
  })
})
