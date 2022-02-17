import { relative } from 'path'

import { testConfig } from '../../root.config'
import {
  authShouldFailedWithNotFoundFromDebug,
  authShouldPassthroughNotFound,
} from '../helper'

import {
  Context,
  initialJwtMiddlewareConfig,
  JwtMiddlewareConfig,
} from '~/index'
import { JwtMiddleware } from '~/middleware/jwt.middleware'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('Should JwtMiddlewareConfig.debug work true', () => {
    it('normal', async () => {
      const { app } = testConfig
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
        debug: true,
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      const mw = await container.getAsync(JwtMiddleware)
      const ctx: Context = app.createAnonymousContext() as Context

      ctx.path = path
      await authShouldFailedWithNotFoundFromDebug(ctx, mw)
    })

    it('ignored with passthrough:true', async () => {
      const { app } = testConfig
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
        debug: true,
        passthrough: true,
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      const mw = await container.getAsync(JwtMiddleware)
      const ctx: Context = app.createAnonymousContext() as Context

      ctx.path = path
      await authShouldPassthroughNotFound(ctx, mw)
    })
  })
})

