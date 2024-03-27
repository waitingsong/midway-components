import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'


import { jwtMiddlewareConfig as mConfig } from '##/config/config.unittest.js'
import { ConfigKey, MiddlewareConfig } from '##/lib/types.js'
import { authHeader1, payload1 } from '#@/mock-data.js'
import { testConfig } from '#@/root.config.js'

import {
  authShouldPassed,
  authShouldSkipped,
  authShouldValidatFailed,
} from '../helper.js'


describe(fileShortPath(import.meta.url), () => {

  const path = '/test'

  describe('Should JwtComponent.validateToken() work with header', () => {
    it('auth skipped', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        enableMiddleware: true,
        ignore: [path],
      }
      app.addConfigObject({
        [ConfigKey.middlewareConfig]: mwConfig,
      })

      const sendHeader = {
        authorization: authHeader1,
      }
      const resp = await httpRequest
        .get(path)
        .set(sendHeader)
      authShouldSkipped(resp)
    })

    it('auth testing passed', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        ...mConfig,
      }
      app.addConfigObject({
        [ConfigKey.middlewareConfig]: mwConfig,
      })

      const sendHeader = {
        authorization: authHeader1,
      }
      const resp = await httpRequest
        .get(path)
        .set(sendHeader)
      authShouldPassed(resp, payload1)
    })

    it('auth validation failed', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        ...mConfig,
      }
      app.addConfigObject({
        [ConfigKey.middlewareConfig]: mwConfig,
      })

      const sendHeader = {
        authorization: authHeader1 + 'fake',
      }
      const resp = await httpRequest
        .get(path)
        .set(sendHeader)
      authShouldValidatFailed(resp)
    })
  })
})

