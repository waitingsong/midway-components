import { relative } from 'path'

import { authShouldSkipped } from '../helper'

import { mwConfig as mConfig } from '@/config.unittest'
import { testConfig } from '@/root.config'
import { ConfigKey, MiddlewareConfig } from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  const path = '/test'

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

