import { relative } from 'path'

import { MidwayWebMiddleware } from '@midwayjs/web'

import { testConfig } from '../../root.config'
import { authHeader1, payload1, secret, token1 } from '../../test.config'
import {
  authShouldFailedWithNotFound,
  authShouldPassed,
  authShouldPassthroughNotFound,
} from '../helper'

import {
  Context,
  initialJwtMiddlewareConfig,
  JwtConfig,
  JwtMiddlewareConfig,
  passthroughCallback,
} from '~/index'
import { JwtMiddleware } from '~/middleware/jwt.middleware'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  const cb: passthroughCallback = async () => true

  describe('Should JwtAuthenticateOptions.passthrough work with func', () => {
    it('true: passed', async () => {
      const { app } = testConfig
      const jwtConfig: JwtConfig = {
        secret,
      }
      const path = '/' + Math.random().toString()
      const path2 = '/redirect-' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
        passthrough: cb,
      }
      app.addConfigObject({ jwtConfig, jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      const inst = await container.getAsync(JwtMiddleware)

      const ctx: Context = app.createAnonymousContext()
      ctx.path = path
      ctx.headers.authorization = authHeader1

      const mw = inst.resolve() as MidwayWebMiddleware
      await authShouldPassed(ctx, mw, payload1)
    })

    it('true: token not found', async () => {
      const { app } = testConfig
      const jwtConfig: JwtConfig = {
        secret,
      }
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
        passthrough: cb,
      }
      app.addConfigObject({ jwtConfig, jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      const inst = await container.getAsync(JwtMiddleware)

      const ctx: Context = app.createAnonymousContext()
      ctx.path = path
      ctx.headers.authorization = ''

      const mw = inst.resolve() as MidwayWebMiddleware
      await authShouldPassthroughNotFound(ctx, mw)
    })

    it('invalid value: token not found', async () => {
      const { app } = testConfig
      const jwtConfig: JwtConfig = {
        secret,
      }
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
        // @ts-expect-error
        passthrough: 0,
      }
      app.addConfigObject({ jwtConfig, jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      const inst = await container.getAsync(JwtMiddleware)

      const ctx: Context = app.createAnonymousContext()
      ctx.path = path
      ctx.headers.authorization = ''

      const mw = inst.resolve() as MidwayWebMiddleware
      await authShouldFailedWithNotFound(ctx, mw, 401)
    })

    it('invalid value 1: token not found', async () => {
      const { app } = testConfig
      const jwtConfig: JwtConfig = {
        secret,
      }
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
        // @ts-expect-error
        passthrough: 1,
      }
      app.addConfigObject({ jwtConfig, jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      const inst = await container.getAsync(JwtMiddleware)

      const ctx: Context = app.createAnonymousContext()
      ctx.path = path
      ctx.headers.authorization = ''

      const mw = inst.resolve() as MidwayWebMiddleware
      await authShouldFailedWithNotFound(ctx, mw, 401)
    })
  })
})

