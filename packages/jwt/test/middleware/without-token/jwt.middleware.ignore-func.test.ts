import { relative } from 'path'

import { authShouldFailedWithNotFound, authShouldSkipped } from '../helper'

import { testConfig } from '@/root.config'
import { jwtMiddlewareConfig as mConfig } from '~/config/config.unittest'
import { ConfigKey, MiddlewareConfig } from '~/lib/types'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

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

