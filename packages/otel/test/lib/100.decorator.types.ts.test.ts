import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { MethodType } from '##/lib/decorator.types.js'


describe(fileShortPath(import.meta.url), function () {

  it(`Should MethodType work`, async () => {
    const ret: MethodType = () => {
      return 'OK'
    }
    assert(ret)
  })

})

