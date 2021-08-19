import { relative } from 'path'

import { MidwayWebMiddleware } from '@midwayjs/web'

import { testConfig } from '../../root.config'
import { secret } from '../../test.config'
import { authShouldFailedWithNotFound, authShouldSkipped } from '../helper'

import {
  Context,
  initialJwtMiddlewareConfig,
  JwtConfig,
  JwtMiddlewareConfig,
  PathPatternFunc,
} from '~/index'
import { JwtMiddleware } from '~/middleware/jwt.middleware'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('Should JwtMiddlewareConfig.ignore work with func', () => {
    it('auth skipped', async () => {
      const { app } = testConfig
      const jwtConfig: JwtConfig = {
        secret,
      }
      const path = '/' + Math.random().toString()
      const cb: PathPatternFunc = (ctx) => {
        const url = ctx.path
        return url === path
      }
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [cb],
      }
      app.addConfigObject({ jwtConfig, jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      const inst = await container.getAsync(JwtMiddleware)

      const ctx: Context = app.createAnonymousContext()
      ctx.path = path

      const mw = inst.resolve() as MidwayWebMiddleware
      await authShouldSkipped(ctx, mw)
    })

    it('auth skipped', async () => {
      const { app } = testConfig
      const jwtConfig: JwtConfig = {
        secret,
      }
      const path = '/' + Math.random().toString()
      const cb: PathPatternFunc = (ctx) => {
        const url = ctx.path
        return url !== path // actual eq
      }
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [cb],
      }
      app.addConfigObject({ jwtConfig, jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      const inst = await container.getAsync(JwtMiddleware)

      const ctx: Context = app.createAnonymousContext()
      ctx.path = path

      const mw = inst.resolve() as MidwayWebMiddleware
      await authShouldFailedWithNotFound(ctx, mw)
    })
  })
})

