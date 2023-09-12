
import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { validateVerifySecret } from '##/index.js'
import { token1 } from '#@/mock-data.js'


describe(fileShortPath(import.meta.url), () => {

  describe('Should validateVerifySecret() work', () => {
    it('with valid input', () => {
      const arr = [
        'abc', '\n', token1,
        Buffer.from('foo'),
      ] as const

      arr.forEach(validateVerifySecret)
    })

    it('with invalid input', () => {
      const arr = [
        '', Buffer.alloc(0), {},
        true, null, void 0, Symbol('foo'),
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => { },
        false,
      ]

      arr.forEach((val) => {
        try {
          // @ts-ignore
          validateVerifySecret(val)
        }
        catch (ex) {
          return assert(true)
        }
        assert(false, 'Should throw error but NOT.')
      })
    })
  })

})

