import { relative } from 'path'

import { testConfig } from '../../root.config'
import { authShouldFailedWithNotFound, authShouldSkipped } from '../helper'

import {
  Context,
  initialJwtMiddlewareConfig,
  JwtMiddlewareConfig,
  PathPatternFunc,
} from '~/index'
import { JwtMiddleware } from '~/middleware/jwt.middleware'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('Should JwtMiddlewareConfig.ignore work with func', () => {
    it('auth skipped', async () => {
      const { app } = testConfig
      const path = '/' + Math.random().toString()
      const cb: PathPatternFunc = (ctx) => {
        const url = ctx.path
        return url === path
      }
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [cb],
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      const mw = await container.getAsync(JwtMiddleware)
      const ctx: Context = app.createAnonymousContext() as Context

      ctx.path = path
      await authShouldSkipped(ctx, mw)
    })

    it('auth skipped', async () => {
      const { app } = testConfig
      const path = '/' + Math.random().toString()
      const cb: PathPatternFunc = (ctx) => {
        const url = ctx.path
        return url !== path // actual eq
      }
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [cb],
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

