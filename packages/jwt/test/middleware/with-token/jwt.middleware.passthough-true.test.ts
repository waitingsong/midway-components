import { relative } from 'path'

import { testConfig } from '../../root.config'
import { authHeader1, payload1, secret, token1 } from '../../test.config'
import {
  authShouldPassed,
  authShouldPassthroughNotFound,
  authShouldPassthroughValidFailed,
} from '../helper'

import {
  Context,
  initialJwtMiddlewareConfig,
  JwtMiddlewareConfig,
} from '~/index'
import { JwtMiddleware } from '~/middleware/jwt.middleware'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('Should JwtAuthenticateOptions.passthrough work with value: true', () => {
    it('passed', async () => {
      const { app } = testConfig
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
        passthrough: true,
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      const mw = await container.getAsync(JwtMiddleware)

      const ctx: Context = app.createAnonymousContext() as Context
      // @ts-expect-error
      ctx.app = app
      ctx.path = path
      ctx.headers.authorization = authHeader1

      await authShouldPassed(ctx, mw, payload1)
    })

    it('token not found', async () => {
      const { app } = testConfig
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
        passthrough: true,
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      const mw = await container.getAsync(JwtMiddleware)

      const ctx: Context = app.createAnonymousContext() as Context
      // @ts-expect-error
      ctx.app = app
      ctx.path = path
      ctx.headers.authorization = ''

      await authShouldPassthroughNotFound(ctx, mw)
    })

    it('token valid faied', async () => {
      const { app } = testConfig
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
        passthrough: true,
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      const mw = await container.getAsync(JwtMiddleware)

      const ctx: Context = app.createAnonymousContext() as Context
      // @ts-expect-error
      ctx.app = app
      ctx.path = path
      ctx.headers.authorization = authHeader1 + 'FAKE'

      await authShouldPassthroughValidFailed(ctx, mw)
    })
  })
})

