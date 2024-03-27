import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'


import {
  ConfigKey,
  MiddlewareConfig,
  PassthroughCallback,
} from '##/lib/types.js'
import { authHeader1, payload1 } from '#@/mock-data.js'
import { testConfig } from '#@/root.config.js'

import {
  authShouldFailedWithNotFound2,
  authShouldPassed,
  authShouldPassthroughNotFound,
} from '../helper.js'


describe(fileShortPath(import.meta.url), () => {

  const callbackTrue: PassthroughCallback = async () => true
  const callbackFalse: PassthroughCallback = async () => false
  const path = '/test'

  describe('Should JwtAuthenticateOptions.passthrough work with func', () => {
    it('true: passed', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        enableMiddleware: true,
        options: {
          passthrough: callbackFalse,
        },
      }
      assert(mwConfig.options)
      app.addConfigObject({
        [ConfigKey.middlewareConfig]: mwConfig,
      })

      const sendHeader = {
        authorization: authHeader1,
      }

      // validate 401 without token and passthrough
      const resp1 = await httpRequest
        .get(path)
      assert(resp1, 'resp1 is empty')
      assert(resp1.status === 401, `resp1.status: ${resp1.status}`)

      mwConfig.options.passthrough = callbackTrue

      const resp = await httpRequest
        .get(path)
        .set(sendHeader)
        .expect(200)

      assert(resp, 'resp is empty')
      authShouldPassed(resp, payload1)
    })

    it('true: w/o token', async () => {
      const { app, httpRequest } = testConfig

      const mwConfig: MiddlewareConfig = {
        enableMiddleware: true,
        options: {
          passthrough: callbackTrue,
        },
      }
      app.addConfigObject({
        [ConfigKey.middlewareConfig]: mwConfig,
      })

      const resp = await httpRequest
        .get(path)
      authShouldPassthroughNotFound(resp, 200)
    })

    it('invalid value: w/o token', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        enableMiddleware: true,
        options: {
          // @ts-expect-error
          passthrough: 0,
        },
      }
      app.addConfigObject({
        [ConfigKey.middlewareConfig]: mwConfig,
      })

      const resp = await httpRequest
        .get(path)
      authShouldFailedWithNotFound2(resp, 401)
    })

    it('invalid value 1: w/o token', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        enableMiddleware: true,
        options: {
          // @ts-expect-error
          passthrough: 1,
        },
      }
      app.addConfigObject({
        [ConfigKey.middlewareConfig]: mwConfig,
      })

      const resp = await httpRequest
        .get(path)
      authShouldFailedWithNotFound2(resp, 401)
    })
  })
})

