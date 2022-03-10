import { relative } from 'path'

import { authShouldFailedWithNotFound, authShouldSkipped } from '../helper'

import { testConfig } from '@/root.config'
import { jwtMiddlewareConfig, jwtMiddlewareOptions } from '@/test.config'
import { JwtMiddlewareConfig } from '~/index'
import { Context } from '~/interface'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  const path = '/test'

  describe('Should JwtMiddlewareConfig.ignore work with func', () => {
    it('auth skipped', async () => {
      const { app, httpRequest } = testConfig
      const cb = (url: string) => {
        return url === path
      }
      const mwConfig: JwtMiddlewareConfig = {
        ...jwtMiddlewareConfig,
        ignore: [cb],
      }
      app.addConfigObject({ jwtMiddlewareConfig: mwConfig })

      const resp = await httpRequest
        .get(path)
      authShouldSkipped(resp)
    })

    it('auth skipped', async () => {
      const { app, httpRequest } = testConfig
      const cb = (url: string) => {
        return url !== path // actual eq
      }
      const mwConfig: JwtMiddlewareConfig = {
        ...jwtMiddlewareConfig,
        ignore: [cb],
      }
      app.addConfigObject({ jwtMiddlewareConfig: mwConfig })

      const resp = await httpRequest
        .get(path)
      authShouldFailedWithNotFound(resp)
    })
  })
})

