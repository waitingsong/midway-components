import assert from 'node:assert/strict'
import { relative } from 'node:path'

import { getNpmPkgViewFromRegistry } from '@waiting/shared-core'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('should work', () => {
    it('getNpmPkgViewFromRegistry()', async () => {
      const pkgName = '@mwcp/otel'
      const info = await getNpmPkgViewFromRegistry(pkgName)
      assert(info?.name === pkgName)

      const info2 = await getNpmPkgViewFromRegistry(pkgName)
      assert(info2?.name === pkgName)
    })
  })

})

