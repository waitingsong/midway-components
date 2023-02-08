import assert from 'node:assert/strict'
import { relative } from 'node:path'

import { fileShortPath } from '@waiting/shared-core'

import { koa } from '../src/config/config.default.js'
import {
  MyError,
  customDecoratorFactory,
  shouldEnableMiddleware,
} from '../src/index.js'


describe(fileShortPath(import.meta.url), () => {

  it('config', async () => {
    assert(koa.port === 7001)
  })

  it('customDecoratorFactory', async () => {
    assert(typeof customDecoratorFactory === 'function')
  })

  it('shouldEnableMiddleware', async () => {
    assert(typeof shouldEnableMiddleware === 'function')
  })

  it('MyError', async () => {
    assert(typeof MyError === 'function')
    const err = new MyError('test', 400)
    assert(err instanceof MyError)
    assert(err instanceof Error)
    assert(err.status === 400)
  })
})

