import { relative } from 'path'

import { VerifyOptions } from 'jsonwebtoken'

import {
  payload1,
  secret,
  token1,
} from '../test.config'

import { Jwt, JwtConfig, VerifyOpts } from '~/index'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('Should Jwt:verify() work', () => {
    it('initializ secret', () => {
      const conf: JwtConfig = {
        secret,
      }
      const jwt = new Jwt(conf)

      const token = jwt.sign(payload1)
      const ret = jwt.verify(token)
      assert.deepStrictEqual(ret.payload, payload1)
    })

    it('without secret', () => {
      const conf: JwtConfig = {
        secret,
      }
      const jwt = new Jwt(conf)

      const token = jwt.sign(payload1, secret)
      const ret = jwt.verify(token, secret)
      assert.deepStrictEqual(ret.payload, payload1)
    })

    it('pass secret', () => {
      const conf: JwtConfig = {
        secret,
      }
      const jwt = new Jwt(conf)

      const token = jwt.sign(payload1, secret)
      const ret = jwt.verify(token, secret)
      assert.deepStrictEqual(ret.payload, payload1)
    })

    it('only initializing secret', () => {
      const conf: JwtConfig = {
        secret: 'notused',
      }
      const jwt = new Jwt(conf)

      const token = jwt.sign(payload1, secret)
      try {
        jwt.verify(token)
      }
      catch (ex) {
        return assert(true)
      }
      assert(false, 'Should throw error but NOT.')
    })

    it('both initializing and passing secret', () => {
      const conf: JwtConfig = {
        secret: 'notused',
      }
      const jwt = new Jwt(conf)

      const token = jwt.sign(payload1, secret)
      const ret = jwt.verify(token, secret)
      assert.deepStrictEqual(ret.payload, payload1)
    })

    it('pass VerifyOptions', async () => {
      const conf: JwtConfig = {
        secret,
      }
      const jwt = new Jwt(conf)

      const token = jwt.sign(payload1, secret)
      const opts: VerifyOptions = {
        complete: true,
      }
      const ret = jwt.verify(token, secret, opts)
      assert.deepStrictEqual(ret.payload, payload1)
    })

    it('pass VerifyOptions ignore complete', async () => {
      const conf: JwtConfig = {
        secret,
      }
      const jwt = new Jwt(conf)

      const token = jwt.sign(payload1, secret)
      const opts: VerifyOptions = {
        complete: false,
      }
      const ret = jwt.verify(token, secret, opts)
      assert.deepStrictEqual(ret.payload, payload1)
    })

    it('with invalid scope', () => {
      const conf: JwtConfig = {
        secret,
      }
      const jwt = new Jwt(conf)

      // eslint-disable-next-line @typescript-eslint/unbound-method
      const { verify } = jwt
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
