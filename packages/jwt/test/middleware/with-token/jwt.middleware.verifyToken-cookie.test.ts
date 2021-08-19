import { relative } from 'path'

import { MidwayWebMiddleware } from '@midwayjs/web'

import { testConfig } from '../../root.config'
import { payload1, secret, token1 } from '../../test.config'
import { authShouldFailedWithNotFound, authShouldPassed, authShouldSkipped } from '../helper'

import {
  Context,
  initialJwtMiddlewareConfig,
  JwtConfig,
  JwtMiddlewareConfig,
} from '~/index'
import { JwtMiddleware } from '~/middleware/jwt.middleware'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('Should JwtComponent.validateToken() work with cookie', () => {
    it('auth skipped', async () => {
      const { app } = testConfig
      const jwtConfig: JwtConfig = {
        secret,
      }
      const path = '/' + Math.random().toString()
      const cookieKey = 'user'
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [path],
      }
      app.addConfigObject({ jwtConfig, jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      // const svc = await container.getAsync(JwtComponent)
      const inst = await container.getAsync(JwtMiddleware)

      const ctx: Context = app.createAnonymousContext()
      ctx.path = path
      ctx.headers.authorization = ''
      ctx.headers.authorization = ''
      ctx.cookies.get = (key) => {
        if (key === cookieKey) {
          return token1
        }
        return ''
      }
      const t1 = ctx.cookies.get(cookieKey)
      assert(t1 === token1)

      const mw = inst.resolve() as MidwayWebMiddleware
      await authShouldSkipped(ctx, mw)
    })

    it('auth test with JwtAuthenticateOptions.cookie user value', async () => {
      const { app } = testConfig
      const jwtConfig: JwtConfig = {
        secret,
      }
      const path = '/' + Math.random().toString()
      const cookieKey = 'user'
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
        cookie: cookieKey,
      }
      app.addConfigObject({ jwtConfig, jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      const inst = await container.getAsync(JwtMiddleware)

      const ctx: Context = app.createAnonymousContext()
      ctx.path = path
      ctx.headers.authorization = ''
      ctx.cookies.get = (key) => {
        if (key === cookieKey) {
          return token1
        }
        return ''
      }
      const t1 = ctx.cookies.get(cookieKey)
      assert(t1 === token1)

      const mw = inst.resolve() as MidwayWebMiddleware
      await authShouldPassed(ctx, mw, payload1)
    })

    it('auth test with JwtAuthenticateOptions.cookie false (default)', async () => {
      const { app } = testConfig
      const jwtConfig: JwtConfig = {
        secret,
      }
      const path = '/' + Math.random().toString()
      const cookieKey = 'user'
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
        cookie: false,
      }
      app.addConfigObject({ jwtConfig, jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      const inst = await container.getAsync(JwtMiddleware)

      const ctx: Context = app.createAnonymousContext()
      ctx.path = path
      ctx.headers.authorization = ''
      ctx.headers.authorization = ''
      ctx.cookies.get = (key) => {
        if (key === cookieKey) {
          return token1
        }
        return ''
      }
      const t1 = ctx.cookies.get(cookieKey)
      assert(t1 === token1)

      const mw = inst.resolve() as MidwayWebMiddleware
      await authShouldFailedWithNotFound(ctx, mw)
    })
  })
})

