import { relative } from 'path'

import { authShouldFailedWithNotFound, authShouldPassed, authShouldSkipped } from '../helper'

import { testConfig, TestResponse } from '@/root.config'
import { payload1, secret, token1 } from '@/test.config'
import {
  initialJwtMiddlewareConfig,
  JwtMiddlewareConfig,
} from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('Should JwtComponent.validateToken() work with cookie', () => {
    it('auth skipped', async () => {
      const { app, httpRequest } = testConfig
      const path = '/' + Math.random().toString()
      const cookieKey = 'user'
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [path],
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const cookie = [`${cookieKey}=${token1}; path=/; expires=Wed, 24 Feb 2021 06:59:09 GMT; httponly`]
      const sendHeader = {
        authorization: '',
        Cookie: cookie,
      }
      const resp = await httpRequest
        .get('/')
        .set(sendHeader) as TestResponse
      await authShouldSkipped(resp)
    })

    it('auth test with JwtAuthenticateOptions.cookie user value', async () => {
      const { app, httpRequest } = testConfig
      const path = '/' + Math.random().toString()
      const cookieKey = 'user'
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
        cookie: cookieKey,
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const cookie = [`${cookieKey}=${token1}; path=/; expires=Wed, 24 Feb 2021 06:59:09 GMT; httponly`]
      const sendHeader = {
        authorization: '',
        Cookie: cookie,
      }
      const resp = await httpRequest
        .get('/')
        .set(sendHeader) as TestResponse
      await authShouldPassed(resp, payload1)
    })

    it('auth test with JwtAuthenticateOptions.cookie false (default)', async () => {
      const { app, httpRequest } = testConfig
      const path = '/' + Math.random().toString()
      const cookieKey = 'user'
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
        cookie: false,
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const cookie = [`${cookieKey}=${token1}; path=/; expires=Wed, 24 Feb 2021 06:59:09 GMT; httponly`]
      const sendHeader = {
        authorization: '',
        Cookie: cookie,
      }
      const resp = await httpRequest
        .get('/')
        .set(sendHeader) as TestResponse
      await authShouldFailedWithNotFound(resp)
    })
  })
})

