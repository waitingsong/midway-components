import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { authShouldFailedWithNotFound, authShouldSkipped } from '../helper.js'

import { jwtMiddlewareConfig as mConfig } from '##/config/config.unittest.js'
import { ConfigKey, MiddlewareConfig } from '##/lib/types.js'
import { testConfig } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), () => {

  const path = '/test'

  describe('Should MiddlewareConfig.ignore work with string', () => {
    it('auth skipped', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        ...mConfig,
        ignore: [path],
      }
      app.addConfigObject({
        [ConfigKey.middlewareConfig]: mwConfig,
      })

      const resp = await httpRequest
        .get(path)
      authShouldSkipped(resp)
    })

    it('auth skipped with empty ignore', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        ...mConfig,
      }
      app.addConfigObject({
        [ConfigKey.middlewareConfig]: mwConfig,
      })

      const resp = await httpRequest
        .get(path)
      authShouldFailedWithNotFound(resp)
    })

    it('auth skipped with random ignore', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        ...mConfig,
        ignore: ['/' + Math.random().toString()],
      }
      app.addConfigObject({
        [ConfigKey.middlewareConfig]: mwConfig,
      })

      const resp = await httpRequest
        .get(path)
      authShouldFailedWithNotFound(resp)
    })

    it('auth skipped mixed with invalid value', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        ...mConfig,
        // @ts-expect-error
        ignore: [false, '', path],
      }
      app.addConfigObject({
        [ConfigKey.middlewareConfig]: mwConfig,
      })

      const resp = await httpRequest
        .get(path)
      authShouldSkipped(resp)
    })

  })
})

