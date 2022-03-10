import { relative } from 'path'

import { authShouldFailedWithNotFound, authShouldPassed, authShouldSkipped } from '../helper'

import { testConfig } from '@/root.config'
import {
  payload1, token1,
  jwtMiddlewareConfig,
  jwtMiddlewareConfigNoOpts,
  jwtMiddlewareOptions,
} from '@/test.config'
import {
  initialMiddlewareConfig,
  JwtMiddlewareConfig,
} from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  const path = '/test'

  describe('Should JwtComponent.validateToken() work with cookie', () => {
    it('auth skipped', async () => {
      const { app, httpRequest } = testConfig
      const cookieKey = 'user'
      const mwConfig: JwtMiddlewareConfig = {
        ...jwtMiddlewareConfigNoOpts,
        ignore: [path],
        options: {
          ...jwtMiddlewareOptions,
          cookie: cookieKey,
        },
      }
      app.addConfigObject({ jwtMiddlewareConfig: mwConfig })

      const cookie = [`${cookieKey}=${token1}`]
      const sendHeader = {
        authorization: '',
        Cookie: cookie,
      }
      const resp = await httpRequest
        .get(path)
        .set(sendHeader)
      authShouldSkipped(resp)
    })

    it('auth test with JwtAuthenticateOptions.cookie user value', async () => {
      const { app, httpRequest } = testConfig
      const cookieKey = 'user'
      const mwConfig: JwtMiddlewareConfig = {
        ...jwtMiddlewareConfigNoOpts,
        options: {
          ...jwtMiddlewareOptions,
          cookie: cookieKey,
        },
      }
      app.addConfigObject({ jwtMiddlewareConfig: mwConfig })

      const cookie = [`${cookieKey}=${token1}; path=/; expires=Wed, 24 Feb 2021 06:59:09 GMT; httponly`]
      const sendHeader = {
        authorization: '',
        Cookie: cookie,
      }
      const resp = await httpRequest
        .get(path)
        .set(sendHeader)
      authShouldPassed(resp, payload1)
    })

    it('auth test with JwtAuthenticateOptions.cookie false (default)', async () => {
      const { app, httpRequest } = testConfig
      const cookieKey = 'user'
      const mwConfig: JwtMiddlewareConfig = {
        ...jwtMiddlewareConfigNoOpts,
        options: {
          ...jwtMiddlewareOptions,
          cookie: false,
        },
      }
      app.addConfigObject({ jwtMiddlewareConfig: mwConfig })

      const cookie = [`${cookieKey}=${token1}; path=/; expires=Wed, 24 Feb 2021 06:59:09 GMT; httponly`]
      const sendHeader = {
        authorization: '',
        Cookie: cookie,
      }
      const resp = await httpRequest
        .get(path)
        .set(sendHeader)
      authShouldFailedWithNotFound(resp)
    })
  })
})

