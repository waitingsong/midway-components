import { relative } from 'path'

import { MidwayWebMiddleware } from '@midwayjs/web'

import { testConfig } from '../../root.config'
import { secret } from '../../test.config'
import {
  authShouldFailedWithNotFoundFromDebug,
  authShouldPassthroughNotFound,
} from '../helper'

import {
  Context,
  initialJwtMiddlewareConfig,
  JwtConfig,
  JwtMiddlewareConfig,
} from '~/index'
import { JwtMiddleware } from '~/middleware/jwt.middleware'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('Should JwtMiddlewareConfig.debug work true', () => {
    it('normal', async () => {
      const { app } = testConfig
      const jwtConfig: JwtConfig = {
        secret,
      }
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
        debug: true,
      }
      app.addConfigObject({ jwtConfig, jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      const inst = await container.getAsync(JwtMiddleware)

      const ctx: Context = app.createAnonymousContext()
      ctx.path = path

      const mw = inst.resolve() as MidwayWebMiddleware
      await authShouldFailedWithNotFoundFromDebug(ctx, mw)
    })

    it('ignored with passthrough:true', async () => {
      const { app } = testConfig
      const jwtConfig: JwtConfig = {
        secret,
      }
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
        debug: true,
        passthrough: true,
      }
      app.addConfigObject({ jwtConfig, jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      const inst = await container.getAsync(JwtMiddleware)

      const ctx: Context = app.createAnonymousContext()
      ctx.path = path

      const mw = inst.resolve() as MidwayWebMiddleware
      await authShouldPassthroughNotFound(ctx, mw)
    })
  })
})

