import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'


import { ConfigKey, MiddlewareConfig } from '##/lib/types.js'
import { testConfig } from '#@/root.config.js'

import {
  authShouldPassthroughEmptyStringNotFound,
  authShouldRedirect,
} from '../helper.js'


describe(fileShortPath(import.meta.url), () => {

  const path = '/test'

  describe('Should JwtAuthenticateOptions.passthrough work with value string', () => {
    it('valid url', async () => {
      const { app, httpRequest } = testConfig
      const path2 = '/redirect-' + Math.random().toString()
      const mwConfig: MiddlewareConfig = {
        enableMiddleware: true,
        options: {
          passthrough: path2,
        },
      }
      app.addConfigObject({
        [ConfigKey.middlewareConfig]: mwConfig,
      })

      const resp = await httpRequest
        .get(path)
      authShouldRedirect(resp, path2)
    })

    it('empty string', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        enableMiddleware: true,
        options: {
          passthrough: '',
        },
      }
      app.addConfigObject({
        [ConfigKey.middlewareConfig]: mwConfig,
      })

      const resp = await httpRequest
        .get(path)
      authShouldPassthroughEmptyStringNotFound(resp, 401)
    })
  })
})

