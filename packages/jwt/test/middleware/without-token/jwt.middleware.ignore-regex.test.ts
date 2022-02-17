import { relative } from 'path'

import { testConfig } from '../../root.config'
import { authShouldFailedWithNotFound, authShouldSkipped } from '../helper'

import {
  Context,
  initialJwtMiddlewareConfig,
  JwtMiddlewareConfig,
} from '~/index'
import { JwtMiddleware } from '~/middleware/jwt.middleware'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('Should JwtMiddlewareConfig.ignore work with regex', () => {
    it('auth skipped', async () => {
      const { app } = testConfig
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [/^\/.+/u],
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      // const svc = await container.getAsync(JwtComponent)
      const mw = await container.getAsync(JwtMiddleware)
      const ctx: Context = app.createAnonymousContext() as Context

      ctx.path = path
      await authShouldSkipped(ctx, mw)
    })

    it('auth skipped2', async () => {
      const { app } = testConfig
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [/\w+/u],
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      const mw = await container.getAsync(JwtMiddleware)
      const ctx: Context = app.createAnonymousContext() as Context

      ctx.path = path
      await authShouldSkipped(ctx, mw)
    })

    it('auth testing 1', async () => {
      const { app } = testConfig
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [/^\/$/u],
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      const mw = await container.getAsync(JwtMiddleware)
      const ctx: Context = app.createAnonymousContext() as Context

      ctx.path = path
      await authShouldFailedWithNotFound(ctx, mw)
    })

    it('auth testing 2', async () => {
      const { app } = testConfig
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [/^\/$/u],
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      const mw = await container.getAsync(JwtMiddleware)
      const ctx: Context = app.createAnonymousContext() as Context

      ctx.path = path
      await authShouldFailedWithNotFound(ctx, mw)
    })
  })
})

