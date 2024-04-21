import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'
import type { MethodTypeUnknown } from '@waiting/shared-types'


describe(fileShortPath(import.meta.url), function () {

  it(`Should MethodTypeUnknown work`, async () => {
    const ret: MethodTypeUnknown = () => {
      return 'OK'
    }
    assert(ret)

    const ret2: MethodTypeUnknown = async () => {
      return 'OK'
    }
    assert(ret2)
  })

})

