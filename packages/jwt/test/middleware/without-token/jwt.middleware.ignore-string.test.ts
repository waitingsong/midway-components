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

  describe('Should JwtMiddlewareConfig.ignore work with string', () => {
    it('auth skipped', async () => {
      const { app } = testConfig
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [path],
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      // const svc = await container.getAsync(JwtComponent)
      const mw = await container.getAsync(JwtMiddleware)
      const ctx: Context = app.createAnonymousContext() as Context
      // @ts-expect-error
      ctx.app = app
      ctx.path = path
      await authShouldSkipped(ctx, mw)
    })

    it('auth skipped with empty ignore', async () => {
      const { app } = testConfig
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      const mw = await container.getAsync(JwtMiddleware)
      const ctx: Context = app.createAnonymousContext() as Context

      ctx.path = path
      await authShouldFailedWithNotFound(ctx, mw)
    })

    it('auth skipped with random ignore', async () => {
      const { app } = testConfig
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: ['/' + Math.random().toString()],
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      const mw = await container.getAsync(JwtMiddleware)
      const ctx: Context = app.createAnonymousContext() as Context
      // @ts-expect-error
      ctx.app = app
      ctx.path = path
      await authShouldFailedWithNotFound(ctx, mw)
    })

    it('auth skipped mixed with invalid value', async () => {
      const { app } = testConfig
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        // @ts-expect-error
        ignore: [false, '', path],
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      // const svc = await container.getAsync(JwtComponent)
      const mw = await container.getAsync(JwtMiddleware)
      const ctx: Context = app.createAnonymousContext() as Context
      // @ts-expect-error
      ctx.app = app
      ctx.path = path
      await authShouldSkipped(ctx, mw)
    })

  })
})

