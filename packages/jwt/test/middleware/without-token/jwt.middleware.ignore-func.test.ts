import { relative } from 'path'

import { authShouldFailedWithNotFound, authShouldSkipped } from '../helper'

import { testConfig } from '@/root.config'
import { mwConfig as mConfig, mwOptions } from '@/test.config'
import { ConfigKey, MiddlewareConfig } from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  const path = '/test'

  describe('Should MiddlewareConfig.ignore work with func', () => {
    it('auth skipped', async () => {
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

    it('auth skipped', async () => {
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
      authShouldFailedWithNotFound(resp)
    })
  })
})

