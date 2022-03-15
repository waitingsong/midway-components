import assert from 'assert/strict'
import { relative } from 'path'

import {
  payload1,
  PayloadSig1,
  PayloadExt1,
  secret,
  signature1,
  token1,
} from '../test.config'

import { Jwt, Config } from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('Should Jwt:decode() work', () => {
    it('normal string', () => {
      const conf: Config = {
        secret,
      }
      const jwt = new Jwt(conf)

      const input = 'fooabc' + Math.random().toString()
      const token = jwt.sign(input, secret)
      const ret = jwt.decode<string>(token)
      assert(ret.payload === input)
    })

    it('various generics types', () => {
      const conf: Config = {
        secret,
      }
      const jwt = new Jwt(conf)
      const token = jwt.sign(payload1, secret)

      const ret1 = jwt.decode<PayloadSig1>(token) // index signature
      const ret2 = jwt.decode<PayloadExt1>(token) // extends from
      const ret3 = jwt.decode<typeof payload1>(token) // pick type
      const ret4 = jwt.decode(token) // default jsont type

      assert.deepStrictEqual(ret1.payload, payload1)
      assert.deepStrictEqual(ret2.payload, payload1)
      assert.deepStrictEqual(ret3.payload, payload1)
      assert.deepStrictEqual(ret4.payload, payload1)
    })

    it('pass secret', () => {
      const conf: Config = {
        secret,
      }
      const jwt = new Jwt(conf)

      const token = jwt.sign(payload1, secret)
      const ret = jwt.decode<PayloadSig1>(token)
      const { header, payload, signature } = ret

      assert(header && header.alg === 'HS256')
      assert(header.typ === 'JWT')
      assert(signature === signature1)
      assert.deepStrictEqual(payload, payload1)
    })

    it('with invalid scope', () => {
      const conf: Config = {
        secret,
      }
      const jwt = new Jwt(conf)

      // eslint-disable-next-line @typescript-eslint/unbound-method
      const { decode } = jwt
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
