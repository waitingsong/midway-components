import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { jwtMiddlewareConfig as mConfig } from '##/config/config.unittest.js'
import { ConfigKey } from '##/lib/types.js'
import type { MiddlewareConfig } from '##/lib/types.js'
import { apiBase, apiMethod } from '#@/api-test.js'
import { testConfig } from '#@/root.config.js'

import { authShouldSkipped } from '../helper.js'


describe(fileShortPath(import.meta.url), () => {

  const path = `/${apiMethod.test}`

  describe('Should MiddlewareConfig.ignore work with regex', () => {
    it('auth skipped', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        ...mConfig,
        ignore: [/^\/.*/u],
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

