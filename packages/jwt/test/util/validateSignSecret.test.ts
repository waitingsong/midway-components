import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { validateSignSecret } from '##/index.js'
import { token1 } from '#@/mock-data.js'


describe(fileShortPath(import.meta.url), () => {

  describe('Should validateSignSecret() work', () => {
    it('with valid input', () => {
      const arr = [
        'abc', '\n', token1,
        { key: 'foo', passphrase: 'bar' },
        Buffer.from('foo'),
      ]

      arr.forEach(validateSignSecret)
    })

    it('with invalid input', () => {
      const arr = [
        '', Buffer.alloc(0),
        {}, { foo: 'bar' },
        { key: 123 },
        { passphrase: 123 },
        true, false, null, void 0, Symbol('foo'),
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {},
      ]

      arr.forEach((val) => {
        try {
          // @ts-ignore
          validateSignSecret(val)
        }
        catch (ex) {
          return assert(true)
        }
        assert(false, 'Should throw error but NOT.')
      })
    })
  })

})

