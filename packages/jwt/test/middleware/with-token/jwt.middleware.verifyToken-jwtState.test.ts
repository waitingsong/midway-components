import { relative } from 'path'

import { IMidwayKoaNext } from '@midwayjs/koa'
import { MidwayWebMiddleware } from '@midwayjs/web'

import { testConfig } from '../../root.config'
import { authHeader1, payload1, secret, token1 } from '../../test.config'
import {
  authShouldFailedWithNotFound,
  authShouldPassed,
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

  describe('Should JwtComponent.validateToken() work with scret from ctx', () => {
    it('passed with ctx.jwtState.secret', async () => {
      const { app } = testConfig
      const jwtConfig: JwtConfig = {
        secret: 'FAKE',
      }
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
      }
      app.addConfigObject({ jwtConfig, jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      const inst = await container.getAsync(JwtMiddleware)

      const ctx: Context = app.createAnonymousContext()
      ctx.path = path
      ctx.headers.authorization = authHeader1
      ctx.jwtState = {
        secret,
      }

      const mw = inst.resolve() as MidwayWebMiddleware
      await authShouldPassed(ctx, mw, payload1)
    })
    it.only('passed with ctx.state.secret', async () => {
      const { app } = testConfig
      const jwtConfig: JwtConfig = {
        secret: 'FAKE',
      }
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
      }
      app.addConfigObject({ jwtConfig, jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      const inst = await container.getAsync(JwtMiddleware)

      const ctx: Context = app.createAnonymousContext()
      ctx.path = path
      ctx.headers.authorization = authHeader1
      ctx.state = {
        secret,
      }

      const mw = inst.resolve() as MidwayWebMiddleware
      await authShouldPassed(ctx, mw, payload1)
    })

  })
})

