import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'


import { jwtMiddlewareConfig as mConfig } from '##/config/config.unittest.js'
import { ConfigKey, MiddlewareConfig } from '##/lib/types.js'
import { testConfig } from '#@/root.config.js'

import { authShouldFailedWithNotFound, authShouldSkipped } from '../helper.js'


describe(fileShortPath(import.meta.url), () => {

  const path = '/test'

  describe('Should MiddlewareConfig.ignore work with func', () => {
    it('auth skipped eq', async () => {
      const { app, httpRequest } = testConfig
      const cb = (url: string) => {
        return url === path
      }
      const mwConfig: MiddlewareConfig = {
        ...mConfig,
        ignore: [cb],
      }
      app.addConfigObject({
        [ConfigKey.middlewareConfig]: mwConfig,
      })

      const resp = await httpRequest
        .get(path)
      authShouldSkipped(resp)
    })

    it('auth skipped neq', async () => {
      const { app, httpRequest } = testConfig
      const cb = (url: string) => {
        return url !== path // actual eq
      }
      const mwConfig: MiddlewareConfig = {
        ...mConfig,
        ignore: [cb],
      }
      app.addConfigObject({
        [ConfigKey.middlewareConfig]: mwConfig,
      })

      const resp = await httpRequest
        .get(path)

      console.log(resp.body)
      authShouldFailedWithNotFound(resp)
    })
  })
})

