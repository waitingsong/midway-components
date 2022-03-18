import assert from 'assert/strict'
import { relative } from 'path'

import { token1 } from '../test.config'

import { validatePayload } from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('Should validatePayload() work', () => {
    it('with valid input', () => {
      const arr = [
        'abc', '\n', token1,
        Buffer.from('foo'),
        { foo: 'bar' },
      ]

      arr.forEach(validatePayload)
    })

    it('with invalid input', () => {
      const arr = [
        '', Buffer.alloc(0), {},
        true, false, null, void 0, Symbol('foo'),
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {},
      ]

      arr.forEach((val) => {
        try {
          // @ts-ignore
          validatePayload(val)
        }
        catch (ex) {
          return assert(true)
        }
        assert(false, 'Should throw error but NOT.')
      })
    })
  })

})

