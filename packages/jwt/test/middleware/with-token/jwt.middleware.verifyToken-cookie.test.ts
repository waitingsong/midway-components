import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { initialMiddlewareConfig, initPathArray } from '##/lib/config.js'
import { ConfigKey } from '##/lib/types.js'
import type { MiddlewareConfig } from '##/lib/types.js'
import { apiBase, apiMethod } from '#@/api-test.js'
import { payload1, token1 } from '#@/mock-data.js'
import { testConfig } from '#@/root.config.js'

import { authShouldFailedWithNotFound, authShouldPassed, authShouldSkipped } from '../helper.js'


describe(fileShortPath(import.meta.url), () => {

  const path = `/${apiMethod.test}`

  describe('Should JwtComponent.validateToken() work with cookie', () => {
    it('auth skipped', async () => {
      const { app, httpRequest } = testConfig
      const cookieKey = 'user'
      const mwConfig: MiddlewareConfig = {
        enableMiddleware: true,
        ignore: [path],
        options: {
          cookie: cookieKey,
        },
      }
      app.addConfigObject({
        [ConfigKey.middlewareConfig]: mwConfig,
      })

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
      const mwConfig: MiddlewareConfig = {
        enableMiddleware: true,
        ignore: initPathArray,
        options: {
          cookie: cookieKey,
        },
      }
      app.addConfigObject({
        [ConfigKey.middlewareConfig]: mwConfig,
      })

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
      const mwConfig: MiddlewareConfig = {
        enableMiddleware: true,
        ignore: initPathArray,
        options: {
          ...initialMiddlewareConfig.options,
        },
      }
      app.addConfigObject({
        [ConfigKey.middlewareConfig]: mwConfig,
      })

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

