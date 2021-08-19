import { relative } from 'path'

import { IMidwayKoaNext } from '@midwayjs/koa'
import { MidwayWebMiddleware } from '@midwayjs/web'

import { testConfig } from '../../root.config'
import { authHeader1, payload1, secret, token1 } from '../../test.config'
import {
  authShouldFailedWithNotFound,
  authShouldPassed,
  authShouldPassthroughNotFound,
  authShouldPassthroughValidFailed,
  authShouldSkipped,
  authShouldValidatFailed,
} from '../helper'

import {
  Context,
  initialJwtMiddlewareConfig,
  JwtConfig,
  JwtMiddlewareConfig,
  JwtMsg,
} from '~/index'
import { JwtMiddleware } from '~/middleware/jwt.middleware'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')
const next: IMidwayKoaNext = async () => { return }

describe(filename, () => {

  describe('Should JwtAuthenticateOptions.passthrough work', () => {
    it('true with passed', async () => {
      const { app } = testConfig
      const jwtConfig: JwtConfig = {
        secret,
      }
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
        passthrough: true,
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

    it('true with token not found', async () => {
      const { app } = testConfig
      const jwtConfig: JwtConfig = {
        secret,
      }
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
        passthrough: true,
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

    it('true with token not found', async () => {
      const { app } = testConfig
      const jwtConfig: JwtConfig = {
        secret,
      }
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
        passthrough: true,
      }
      app.addConfigObject({ jwtConfig, jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      const inst = await container.getAsync(JwtMiddleware)

      const ctx: Context = app.createAnonymousContext()
      ctx.path = path
      ctx.headers.authorization = authHeader1 + 'FAKE'

      const mw = inst.resolve() as MidwayWebMiddleware
      await authShouldPassthroughValidFailed(ctx, mw)
    })
  })
})

