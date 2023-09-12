import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { validateTokenString } from '##/index.js'


describe(fileShortPath(import.meta.url), () => {

  describe('Should validateTokenString() work', () => {
    it('with invalid input', () => {
      const arr = [true, false, null, void 0, '']

      arr.forEach((val) => {
        try {
          // @ts-ignore
          validateTokenString(val)
        }
        catch (ex) {
          return assert(true)
        }
        assert(false, 'Should throw error but NOT.')
      })
    })
  })

})

