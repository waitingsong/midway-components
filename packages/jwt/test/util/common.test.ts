import assert from 'assert/strict'
import { relative } from 'path'

import { Context } from '~/interface'
import { reqestPathMatched } from '~/util/common'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('Should common() work', () => {
    it('with valid rules', () => {
      const ret = reqestPathMatched(true as unknown as Context)
      assert(ret === false)
    })

    it('with empty array', () => {
      const ret = reqestPathMatched(true as unknown as Context, [])
      assert(ret === false)
    })

    it('with invalid rule', () => {
      try {
        // @ts-expect-error
        reqestPathMatched({ path: 'foo' } as unknown as Context, [Symbol()])
      }
      catch (ex) {
        assert(ex && ex instanceof TypeError)
        return
      }
      assert(false, 'should throw TypeError, but not.')
    })
  })

})

