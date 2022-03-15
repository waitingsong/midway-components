import assert from 'assert/strict'
import { relative } from 'path'

import {
  payload1,
  payload2,
  secret,
  token1,
  token7d,
  tokenHeader2,
} from '../test.config'

import { Jwt, Config, SignOptions } from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('Should Jwt:sign() work', () => {
    it('config secret', async () => {
      const conf: Config = {
        secret,
      }
      const jwt = new Jwt(conf)

      const token = jwt.sign(payload1)
      assert(token === token1)
    })

    it('pass secret', async () => {
      const conf: Config = {
        secret,
      }
      const jwt = new Jwt(conf)

      const token = jwt.sign(payload1, secret)
      assert(token === token1)
    })

    it('both initializing and passing secret', async () => {
      const conf: Config = {
        secret: 'notused',
      }
      const jwt = new Jwt(conf)

      const token = jwt.sign(payload1, secret)
      assert(token === token1)
    })

    it('without iat', async () => {
      const conf: Config = {
        secret,
      }
      const jwt = new Jwt(conf)

      const token = jwt.sign(payload2)
      assert(token.indexOf(tokenHeader2) === 0)
    })

    it('pass SignOptions', async () => {
      const conf: Config = {
        secret,
      }
      const jwt = new Jwt(conf)

      const opts: SignOptions = {
        expiresIn: '7d',
      }
      const token = jwt.sign(payload1, secret, opts)
      assert(token === token7d)
    })

    it('with invalid scope', async () => {
      const conf: Config = {
        secret,
      }
      const jwt = new Jwt(conf)

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
