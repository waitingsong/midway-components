import { relative } from 'path'

import { IMidwayKoaNext } from '@midwayjs/koa'
import { MidwayWebMiddleware } from '@midwayjs/web'

import { testConfig } from '../../root.config'
import { authHeader1, payload1, secret, token1 } from '../../test.config'
import {
  authShouldFailedWithNotFound,
  authShouldPassed,
  authShouldPassthroughEmptyStringNotFound,
  authShouldPassthroughNotFound,
  authShouldPassthroughValidFailed,
  authShouldRedirect,
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

  describe('Should JwtAuthenticateOptions.passthrough work with value string', () => {
    it('valid url', async () => {
      const { app } = testConfig
      const jwtConfig: JwtConfig = {
        secret,
      }
      const path = '/' + Math.random().toString()
      const path2 = '/redirect-' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
        passthrough: path2,
      }
      app.addConfigObject({ jwtConfig, jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      const inst = await container.getAsync(JwtMiddleware)

      const ctx: Context = app.createAnonymousContext()
      ctx.path = path
      ctx.headers.authorization = ''

      const mw = inst.resolve() as MidwayWebMiddleware
      await authShouldRedirect(ctx, mw, path2)
    })

    it('empty string', async () => {
      const { app } = testConfig
      const jwtConfig: JwtConfig = {
        secret,
      }
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
        passthrough: '',
      }
      app.addConfigObject({ jwtConfig, jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      const inst = await container.getAsync(JwtMiddleware)

      const ctx: Context = app.createAnonymousContext()
      ctx.path = path
      ctx.headers.authorization = ''

      const mw = inst.resolve() as MidwayWebMiddleware
      await authShouldPassthroughEmptyStringNotFound(ctx, mw, 401)
    })
  })
})

