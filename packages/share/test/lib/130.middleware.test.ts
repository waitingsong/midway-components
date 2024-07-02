import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { shouldEnableMiddleware } from '##/index.js'
import type { Context, MiddlewareConfig } from '##/index.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), () => {


  describe('shouldEnableMiddleware', () => {
    it('empty ctx', () => {
      const ret = shouldEnableMiddleware()
      assert(! ret)
    })

    it('empty path', () => {
      const ctx = {
        path: '',
      } as Context

      const ret = shouldEnableMiddleware(ctx)
      assert(! ret)
    })

    it(`w/o middlewareConfig`, () => {
      const ctx = {
        path: '/test',
      } as Context

      const ret = shouldEnableMiddleware(ctx)
      assert(! ret)
    })

    it(`with middlewareConfig: enableMiddleware=false`, () => {
      const ctx = {
        path: '/test',
      } as Context
      const mwConfig: MiddlewareConfig<undefined> = {
        enableMiddleware: false,
        match: ['/test'],
      }

      const ret = shouldEnableMiddleware(ctx, mwConfig)
      assert(! ret)
    })


    it(`with middlewareConfig: empty rules`, () => {
      const ctx = {
        path: '/test',
      } as Context
      const mwConfig: MiddlewareConfig<undefined> = {
        enableMiddleware: true,
      }

      const ret = shouldEnableMiddleware(ctx, mwConfig)
      assert(ret)
    })


    it(`with middlewareConfig: match rules string`, () => {
      const ctx = {
        path: '/test',
      } as Context
      const mwConfig: MiddlewareConfig<undefined> = {
        enableMiddleware: true,
        match: ['/test'],
      }

      const ret = shouldEnableMiddleware(ctx, mwConfig)
      assert(ret)
    })

    it(`with middlewareConfig: match rules regex`, () => {
      const ctx = {
        path: '/test',
      } as Context
      const mwConfig: MiddlewareConfig<undefined> = {
        enableMiddleware: true,
        match: [/^\/t\w+/u],
      }
      const ret = shouldEnableMiddleware(ctx, mwConfig)
      assert(ret)
    })

    it(`with middlewareConfig: match rules array`, () => {
      const ctx = {
        path: '/test',
      } as Context
      const mwConfig: MiddlewareConfig<undefined> = {
        enableMiddleware: true,
        match: ['/fake', /^\/t\w+/u],
      }

      const ret = shouldEnableMiddleware(ctx, mwConfig)
      assert(ret)
    })


    it(`with middlewareConfig: ignore rules string`, () => {
      const ctx = {
        path: '/test',
      } as Context
      const mwConfig: MiddlewareConfig<undefined> = {
        enableMiddleware: true,
        ignore: ['/test'],
      }

      const ret = shouldEnableMiddleware(ctx, mwConfig)
      assert(! ret)
    })

    it(`with middlewareConfig: ignore rules regex`, () => {
      const ctx = {
        path: '/test',
      } as Context
      const mwConfig: MiddlewareConfig<undefined> = {
        enableMiddleware: true,
        ignore: [/^\/t\w+/u],
      }

      const ret = shouldEnableMiddleware(ctx, mwConfig)
      assert(! ret)
    })

    it(`with middlewareConfig: ignore rules array`, () => {
      const ctx = {
        path: '/test',
      } as Context
      const mwConfig: MiddlewareConfig<undefined> = {
        enableMiddleware: true,
        ignore: ['/fake', /^\/t\w+/u],
      }

      const ret = shouldEnableMiddleware(ctx, mwConfig)
      assert(! ret)
    })

  })


})

