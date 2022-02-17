import { relative } from 'path'

import { testConfig } from '../../root.config'
import { authHeader1, payload1, secret, token1 } from '../../test.config'
import { authShouldPassed } from '../helper'

import {
  Context,
  initialJwtMiddlewareConfig,
  JwtConfig,
  JwtMiddlewareConfig,
} from '~/index'
import { JwtMiddleware } from '~/middleware/jwt.middleware'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('Should JwtComponent.validateToken() work with scret from ctx', () => {
    const jwtConfig: JwtConfig = {
      secret: 'FAKE',
    }

    it('passed with ctx.jwtState.secret', async () => {
      const { app } = testConfig
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
      }
      app.addConfigObject({ jwtConfig, jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      const mw = await container.getAsync(JwtMiddleware)
      const ctx: Context = app.createAnonymousContext() as Context
      ctx.path = path
      ctx.headers.authorization = authHeader1
      ctx.jwtState = {
        secret,
      }

      await authShouldPassed(ctx, mw, payload1)
    })

    it('passed with ctx.state.secret', async () => {
      const { app } = testConfig
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
      }
      app.addConfigObject({ jwtConfig, jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      const mw = await container.getAsync(JwtMiddleware)
      const ctx: Context = app.createAnonymousContext() as Context
      ctx.path = path
      ctx.headers.authorization = authHeader1
      ctx.state = {
        secret,
      }

      await authShouldPassed(ctx, mw, payload1)
    })

  })
})

