import { relative } from 'path'

import { authShouldFailedWithNotFound, authShouldSkipped } from '../helper'

import { mwConfig as mConfig } from '@/config.unittest'
import { testConfig } from '@/root.config'
import { ConfigKey, MiddlewareConfig } from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

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

