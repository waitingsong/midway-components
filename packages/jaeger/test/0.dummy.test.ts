import assert from 'node:assert/strict'
import { relative } from 'node:path'

import { testBaseDir } from './root.config.js'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('should work', () => {
    it('always passed', () => {
      assert(testBaseDir)
    })
  })

})

