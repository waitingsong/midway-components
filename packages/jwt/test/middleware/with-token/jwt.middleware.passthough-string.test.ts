import { relative } from 'path'

import { testConfig } from '../../root.config'
import {
  authShouldPassthroughEmptyStringNotFound,
  authShouldRedirect,
} from '../helper'

import {
  Context,
  initialJwtMiddlewareConfig,
  JwtMiddlewareConfig,
} from '~/index'
import { JwtMiddleware } from '~/middleware/jwt.middleware'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('Should JwtAuthenticateOptions.passthrough work with value string', () => {
    it('valid url', async () => {
      const { app } = testConfig
      const path = '/' + Math.random().toString()
      const path2 = '/redirect-' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
        passthrough: path2,
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      const mw = await container.getAsync(JwtMiddleware)

      const ctx: Context = app.createAnonymousContext() as Context
      // @ts-expect-error
      ctx.app = app
      ctx.path = path
      ctx.headers.authorization = ''

      await authShouldRedirect(ctx, mw, path2)
    })

    it('empty string', async () => {
      const { app } = testConfig
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
        passthrough: '',
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      const mw = await container.getAsync(JwtMiddleware)

      const ctx: Context = app.createAnonymousContext() as Context
      // @ts-expect-error
      ctx.app = app
      ctx.path = path
      ctx.headers.authorization = ''

      await authShouldPassthroughEmptyStringNotFound(ctx, mw, 401)
    })
  })
})

