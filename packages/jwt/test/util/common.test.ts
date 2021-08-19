import { relative } from 'path'

import { Context } from '~/interface'
import { reqestPathMatched } from '~/util/common'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('Should common() work', () => {
    it('with valid input 1', () => {
      const ret = reqestPathMatched(true as unknown as Context)
      assert(ret === false)
    })

    it('with empty array', () => {
      const ret = reqestPathMatched(true as unknown as Context, [])
      assert(ret === false)
    })
  })

})

