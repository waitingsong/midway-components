import { relative } from 'path'

import { testConfig } from '../../root.config'
import { authHeader1, payload1, secret, token1 } from '../../test.config'
import {
  authShouldPassed,
  authShouldSkipped,
  authShouldValidatFailed,
} from '../helper'

import {
  Context,
  initialJwtMiddlewareConfig,
  JwtMiddlewareConfig,
} from '~/index'
import { JwtMiddleware } from '~/middleware/jwt.middleware'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('Should JwtComponent.validateToken() work with header', () => {
    it('auth skipped', async () => {
      const { app } = testConfig
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [path],
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      // const svc = await container.getAsync(JwtComponent)
      const mw = await container.getAsync(JwtMiddleware)

      const ctx: Context = app.createAnonymousContext() as Context
      ctx.path = path
      ctx.headers.authorization = authHeader1

      await authShouldSkipped(ctx, mw)
    })

    it('auth testing passed', async () => {
      const { app } = testConfig
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      const mw = await container.getAsync(JwtMiddleware)

      const ctx: Context = app.createAnonymousContext() as Context
      ctx.path = path
      ctx.headers.authorization = authHeader1

      await authShouldPassed(ctx, mw, payload1)
    })

    it('auth validation failed', async () => {
      const { app } = testConfig
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      const mw = await container.getAsync(JwtMiddleware)

      const ctx: Context = app.createAnonymousContext() as Context
      ctx.path = path
      ctx.headers.authorization = authHeader1 + 'fake'

      await authShouldValidatFailed(ctx, mw)
    })
  })
})

