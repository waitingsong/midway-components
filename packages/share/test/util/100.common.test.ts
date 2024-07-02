import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { requestPathMatched } from '##/index.js'
import type { MiddlewareConfig } from '##/index.js'


describe(fileShortPath(import.meta.url), () => {
  describe(`Should requestPathMatched() work`, () => {

    it(`w/o middlewareConfig`, () => {
      const path = '/test'
      const ret = requestPathMatched(path)
      assert(! ret)
    })

    it(`with middlewareConfig: enableMiddleware=false`, () => {
      const path = '/test'
      const mwConfig: MiddlewareConfig<undefined> = {
        enableMiddleware: false,
        match: ['/test'],
      }
      const ret = requestPathMatched(path, mwConfig)
      assert(! ret)
    })


    it(`with middlewareConfig: empty rules`, () => {
      const path = '/test'
      const mwConfig: MiddlewareConfig<undefined> = {
        enableMiddleware: true,
      }
      const ret = requestPathMatched(path, mwConfig)
      assert(ret)
    })


    it(`with middlewareConfig: match rules string`, () => {
      const path = '/test'
      const mwConfig: MiddlewareConfig<undefined> = {
        enableMiddleware: true,
        match: ['/test'],
      }
      const ret = requestPathMatched(path, mwConfig)
      assert(ret)
    })

    it(`with middlewareConfig: match rules regex`, () => {
      const path = '/test'
      const mwConfig: MiddlewareConfig<undefined> = {
        enableMiddleware: true,
        match: [/^\/t\w+/u],
      }
      const ret = requestPathMatched(path, mwConfig)
      assert(ret)
    })

    it(`with middlewareConfig: match rules array`, () => {
      const path = '/test'
      const mwConfig: MiddlewareConfig<undefined> = {
        enableMiddleware: true,
        match: ['/fake', /^\/t\w+/u],
      }
      const ret = requestPathMatched(path, mwConfig)
      assert(ret)
    })


    it(`with middlewareConfig: ignore rules string`, () => {
      const path = '/test'
      const mwConfig: MiddlewareConfig<undefined> = {
        enableMiddleware: true,
        ignore: ['/test'],
      }
      const ret = requestPathMatched(path, mwConfig)
      assert(! ret)
    })

    it(`with middlewareConfig: ignore rules regex`, () => {
      const path = '/test'
      const mwConfig: MiddlewareConfig<undefined> = {
        enableMiddleware: true,
        ignore: [/^\/t\w+/u],
      }
      const ret = requestPathMatched(path, mwConfig)
      assert(! ret)
    })

    it(`with middlewareConfig: ignore rules array`, () => {
      const path = '/test'
      const mwConfig: MiddlewareConfig<undefined> = {
        enableMiddleware: true,
        ignore: ['/fake', /^\/t\w+/u],
      }
      const ret = requestPathMatched(path, mwConfig)
      assert(! ret)
    })
  })
})

