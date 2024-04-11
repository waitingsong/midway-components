import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { jwtMiddlewareConfig as mConfig } from '##/config/config.unittest.js'
import { Config, ConfigKey, MiddlewareConfig } from '##/lib/types.js'
import { apiBase, apiMethod } from '#@/api-test.js'
import { authHeader1, payload1 } from '#@/mock-data.js'
import { testConfig } from '#@/root.config.js'

import { authShouldPassed } from '../helper.js'


describe(fileShortPath(import.meta.url), () => {

  const path = `/${apiMethod.test}`

  describe('Should JwtComponent.validateToken() work with secret from ctx', () => {
    const config: Config = {
      secret: 'FAKE',
    }

    it('passed with ctx.jwtState.secret', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        ...mConfig,
      }
      app.addConfigObject({
        [ConfigKey.config]: config,
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

    it('passed with ctx.state.secret', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        ...mConfig,
      }
      app.addConfigObject({
        [ConfigKey.config]: config,
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

  })
})

