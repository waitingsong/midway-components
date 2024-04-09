import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { MyError } from '##/index.js'


describe(fileShortPath(import.meta.url), () => {

  describe('Should MyError work', () => {
    it('normal', () => {
      const msg = 'test'
      const inst = new MyError(msg)
      assert(inst instanceof Error)
      assert(inst.message === `${msg} &>500`)
      assert(inst.status === 500)
    })

    it('cause', () => {
      const msg = 'test'
      const cause = new Error('cause message')
      const inst = new MyError(msg, 400, cause)
      assert(inst instanceof Error)
      assert(inst.message === `${msg} &>400`)
      assert(inst.status === 400)
      assert(inst.details === cause)
    })
  })

})

