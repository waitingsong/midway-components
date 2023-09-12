import assert from 'node:assert/strict'

import { getNpmPkgViewFromRegistry, fileShortPath } from '@waiting/shared-core'


describe(fileShortPath(import.meta.url), function() {

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

