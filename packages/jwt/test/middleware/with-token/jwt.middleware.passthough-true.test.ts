import { fileShortPath } from '@waiting/shared-core'

import {
  authShouldPassed,
  authShouldPassthroughNotFound,
  authShouldPassthroughValidFailed,
} from '../helper.js'

import { ConfigKey, MiddlewareConfig } from '##/lib/types.js'
import { authHeader1, payload1 } from '#@/mock-data.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), () => {

  const path = '/test'

  describe('Should JwtAuthenticateOptions.passthrough work with value: true', () => {
    it('passed', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        enableMiddleware: true,
        options: {
          passthrough: true,
        },
      }
      app.addConfigObject({ [ConfigKey.middlewareConfig]: mwConfig })

      const sendHeader = {
        authorization: authHeader1,
      }
      const resp = await httpRequest
        .get(path)
        .set(sendHeader)
      authShouldPassed(resp, payload1)
    })

    it('token not found', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        enableMiddleware: true,
        options: {
          passthrough: true,
        },
      }
      app.addConfigObject({ [ConfigKey.middlewareConfig]: mwConfig })

      const sendHeader = {
        authorization: '',
      }
      const resp = await httpRequest
        .get(path)
      authShouldPassthroughNotFound(resp)
    })

    it('token valid faied', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        enableMiddleware: true,
        options: {
          passthrough: true,
        },
      }
      app.addConfigObject({ [ConfigKey.middlewareConfig]: mwConfig })

      const sendHeader = {
        authorization: authHeader1 + 'FAKE',
      }
      const resp = await httpRequest
        .get(path)
        .set(sendHeader)
      authShouldPassthroughValidFailed(resp)
    })
  })
})

