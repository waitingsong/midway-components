import { relative } from 'path'

import {
  authShouldFailedWithNotFound,
  authShouldFailedWithNotFound2,
  authShouldPassed,
  authShouldPassthroughNotFound,
} from '../helper'

import { testConfig, TestResponse } from '@/root.config'
import { authHeader1, payload1, secret, token1 } from '@/test.config'
import {
  initialJwtMiddlewareConfig,
  JwtMiddlewareConfig,
  passthroughCallback,
} from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  const cb: passthroughCallback = async () => true

  describe('Should JwtAuthenticateOptions.passthrough work with func', () => {
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

      const resp = await httpRequest
        .get('/')
      await authShouldPassthroughNotFound(resp, 200)
    })

    it('invalid value: token not found', async () => {
      const { app, httpRequest } = testConfig
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
        // @ts-expect-error
        passthrough: 0,
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const resp = await httpRequest
        .get('/')
      authShouldFailedWithNotFound2(resp, 401)
    })

    it('invalid value 1: token not found', async () => {
      const { app, httpRequest } = testConfig
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
        // @ts-expect-error
        passthrough: 1,
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const resp = await httpRequest
        .get('/') as TestResponse
      authShouldFailedWithNotFound2(resp, 401)
    })
  })
})

