import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { MyError } from '../src/index.js'


describe(fileShortPath(import.meta.url), () => {

  describe('should work', () => {
    it('normal', () => {
      const rnd = Math.random().toString()
      const err = new MyError(rnd)

      assert(err instanceof MyError)
      assert(err.message.includes(rnd))
    })

    it('cause', () => {
      const rnd = Math.random().toString()
      const cause = new Error(rnd)
      const msg = 'debug'
      const err = new MyError('debug', 400, cause)

      assert(err instanceof MyError)
      assert(err.message.includes(msg))
      assert(! err.message.includes(rnd))
      assert(err.status === 400)
      assert(err.cause instanceof Error)
      assert(err.cause === cause)
      assert(err.cause.message.includes(rnd))

      assert(err.details === cause)
    })
  })

})

