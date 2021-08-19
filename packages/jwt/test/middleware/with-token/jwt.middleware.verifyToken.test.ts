import { relative } from 'path'

import { IMidwayKoaNext } from '@midwayjs/koa'
import { MidwayWebMiddleware } from '@midwayjs/web'

import { testConfig } from '../../root.config'
import { authHeader1, payload1, secret } from '../../test.config'

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

  describe('Should JwtComponent.validateToken() work with header', () => {
    it('auth skipped', async () => {
      const { app } = testConfig
      const jwtConfig: JwtConfig = {
        secret,
      }
      const path = '/' + Math.random().toString()
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
      ctx.headers.authorization = authHeader1

      const mw = inst.resolve() as MidwayWebMiddleware
      // @ts-expect-error
      await mw(ctx, next)
      const { status, jwtState } = ctx
      assert(status === 200)
      assert(! jwtState)
    })

    it('auth testing', async () => {
      const { app } = testConfig
      const jwtConfig: JwtConfig = {
        secret,
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

      const mw = inst.resolve() as MidwayWebMiddleware
      // @ts-expect-error
      await mw(ctx, next)
      const { status, jwtState } = ctx
      assert(status === 200)
      assert(jwtState)
      assert.deepStrictEqual(jwtState && jwtState.user.payload, payload1)
    })
  })
})

