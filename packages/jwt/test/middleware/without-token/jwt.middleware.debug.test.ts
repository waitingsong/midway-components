import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import {
  authShouldFailedWithNotFoundFromDebug,
  authShouldPassthroughNotFound,
} from '../helper.js'

import { ConfigKey, MiddlewareConfig } from '##/lib/types.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), () => {

  const path = '/test'

  describe('Should MiddlewareConfig.debug work true', () => {
    it('normal', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        enableMiddleware: true,
        options: {
          debug: true,
        },
      }
      app.addConfigObject({ [ConfigKey.middlewareConfig]: mwConfig })

      const resp = await httpRequest
        .get(path)
      authShouldFailedWithNotFoundFromDebug(resp)
    })

    it('ignored with passthrough:true', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        enableMiddleware: true,
        options: {
          debug: true,
          passthrough: true,
        },
      }
      app.addConfigObject({ [ConfigKey.middlewareConfig]: mwConfig })

      const resp = await httpRequest
        .get(path)
      authShouldPassthroughNotFound(resp)
    })
  })
})

