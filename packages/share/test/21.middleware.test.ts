import assert from 'node:assert/strict'

import { Context } from '@midwayjs/koa'
import { fileShortPath } from '@waiting/shared-core'
import { MiddlewareConfig, PathPattern } from '@waiting/shared-types'

import { shouldEnableMiddleware } from '../src/index.js'


describe(fileShortPath(import.meta.url), () => {

  describe('should work', () => {
    it('ctx undefined', () => {
      const ret = shouldEnableMiddleware()

      assert(ret === false)
    })

    it('mwConfig undefined', () => {
      const ctx = {} as Context
      const ret = shouldEnableMiddleware(ctx)

      assert(ret === false)
    })

    it('mwConfig.enableMiddleware undefined', () => {
      const ctx = {} as Context
      const mwConfig = {} as MiddlewareConfig
      const ret = shouldEnableMiddleware(ctx, mwConfig)

      assert(ret === false)
    })

    it('mwConfig.enableMiddleware undefined', () => {
      const ctx = {} as Context
      const mwConfig = {} as MiddlewareConfig
      const ret = shouldEnableMiddleware(ctx, mwConfig)

      assert(ret === false)
    })

    it('mwConfig.ignore should false', () => {
      const paths = [
        '/user',
        '/foo/bar',
      ]
      const ignore: PathPattern['ignore'] = [
        '/user',
        /\/foo\/.+/,
      ]
      const mwConfig = {
        enableMiddleware: true,
        ignore,
      } as MiddlewareConfig

      paths.forEach((path) => {
        const ctx = {
          path,
        } as Context

        const ret = shouldEnableMiddleware(ctx, mwConfig)
        assert(ret === false, path)
      })
    })

    it('mwConfig.ignore should true', () => {
      const paths = [
        '/user/',
        '/foo/',
      ]
      const ignore: PathPattern['ignore'] = [
        '/user',
        /\/foo\/.+/,
      ]
      const mwConfig = {
        enableMiddleware: true,
        ignore,
      } as MiddlewareConfig

      paths.forEach((path) => {
        const ctx = {
          path,
        } as Context

        const ret = shouldEnableMiddleware(ctx, mwConfig)
        assert(ret === true, path)
      })
    })


    it('mwConfig.match should false', () => {
      const paths = [
        '/user/',
        '/foo/',
      ]
      const match: PathPattern['match'] = [
        '/user',
        /\/foo\/.+/,
      ]
      const mwConfig = {
        enableMiddleware: true,
        match,
      } as MiddlewareConfig

      paths.forEach((path) => {
        const ctx = {
          path,
        } as Context

        const ret = shouldEnableMiddleware(ctx, mwConfig)
        assert(ret === false, path)
      })
    })

    it('mwConfig.match should true', () => {
      const paths = [
        '/user',
        '/foo/bar',
      ]
      const match: PathPattern['match'] = [
        '/user',
        /\/foo\/.+/,
      ]
      const mwConfig = {
        enableMiddleware: true,
        match,
      } as MiddlewareConfig

      paths.forEach((path) => {
        const ctx = {
          path,
        } as Context

        const ret = shouldEnableMiddleware(ctx, mwConfig)
        assert(ret === true, path)
      })
    })

    it('mwConfig.match/ignore should false', () => {
      const paths = [
        '/user',
        '/foo/',
      ]
      const ignore: PathPattern['ignore'] = [
        '/user',
        /\/foo\/.+/,
      ]
      const match: PathPattern['match'] = [
        '/user',
        /\/foo\/.+/,
      ]
      const mwConfig = {
        enableMiddleware: true,
        ignore,
        match,
      } as MiddlewareConfig

      paths.forEach((path) => {
        const ctx = {
          path,
        } as Context

        const ret = shouldEnableMiddleware(ctx, mwConfig)
        assert(ret === false, path)
      })
    })

    it('mwConfig.match/ignore should true', () => {
      const paths = [
        '/user',
        '/foo/bar',
      ]
      const ignore: PathPattern['ignore'] = ['/user/']
      const match: PathPattern['match'] = [
        '/user',
        /\/foo\/.+/,
      ]
      const mwConfig = {
        enableMiddleware: true,
        ignore,
        match,
      } as MiddlewareConfig

      paths.forEach((path) => {
        const ctx = {
          path,
        } as Context

        const ret = shouldEnableMiddleware(ctx, mwConfig)
        assert(ret === true, path)
      })
    })
  })

})

