import { assert } from 'console'
import { relative } from 'path'

import { createHttpRequest } from '@midwayjs/mock'

import { testConfig, TestResponse } from '../../root.config'
import { authHeader1, payload1, secret, token1 } from '../../test.config'
import {
  authShouldFailedWithNotFound,
  authShouldPassed,
  authShouldPassthroughNotFound,
} from '../helper'

import {
  Context,
  initialJwtMiddlewareConfig,
  JwtMiddlewareConfig,
  passthroughCallback,
} from '~/index'
import { JwtMiddleware } from '~/middleware/jwt.middleware'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe.only(filename, () => {

  const cb: passthroughCallback = async () => true

  describe.only('Should JwtAuthenticateOptions.passthrough work with func', () => {
    it('true: passed', async () => {
      const { app, httpRequest } = testConfig
      const path = '/' + Math.random().toString()
      const path2 = '/redirect-' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
        passthrough: cb,
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const sendHeader = {
        authorization: authHeader1,
      }

      const resp = await httpRequest
        .get('/')
        .set(sendHeader)
        .expect(200) as TestResponse
      assert(resp.text === 'OK')
      await authShouldPassed(resp, payload1)
    })

    it('true: token not found', async () => {
      const { app, httpRequest } = testConfig

      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
        passthrough: cb,
      }
      app.addConfigObject({ jwtMiddlewareConfig })


      const sendHeader = {
        authorization: '',
      }

      const resp = await httpRequest
        .get('/')
        .set(sendHeader) as TestResponse
      assert(resp.text === 'OK')
      await authShouldPassthroughNotFound(resp, 200)
    })

    it.only('invalid value: token not found', async () => {
      const { app, httpRequest } = testConfig
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
        // @ts-expect-error
        passthrough: 0,
      }
      app.addConfigObject({ jwtMiddlewareConfig })


      const sendHeader = {
        authorization: '',
      }

      const resp = await httpRequest
        .get('/')
        .set(sendHeader) as TestResponse
      assert(resp.text === 'OK')

      await authShouldFailedWithNotFound(resp, 401)
    })

    // it('invalid value 1: token not found', async () => {
    //   const { app } = testConfig
    //   const path = '/' + Math.random().toString()
    //   const jwtMiddlewareConfig: JwtMiddlewareConfig = {
    //     ...initialJwtMiddlewareConfig,
    //     ignore: [],
    //     // @ts-expect-error
    //     passthrough: 1,
    //   }
    //   app.addConfigObject({ jwtMiddlewareConfig })

    //   const container = app.getApplicationContext()
    //   const mw = await container.getAsync(JwtMiddleware)

    //   const ctx: Context = app.createAnonymousContext() as Context
    //   // @ts-expect-error
    //   ctx.app = app
    //   ctx.path = path
    //   ctx.header = {
    //     ...ctx.header,
    //     authorization: '',
    //   }

    //   await authShouldFailedWithNotFound(ctx, mw, 401)
    // })
  })
})

