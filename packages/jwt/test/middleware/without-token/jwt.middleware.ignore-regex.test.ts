import { relative } from 'path'

import { authShouldSkipped } from '../helper'

import { testConfig } from '@/root.config'
import { jwtMiddlewareConfig, jwtMiddlewareOptions } from '@/test.config'
import { JwtMiddlewareConfig } from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  const path = '/test'

  describe('Should JwtMiddlewareConfig.ignore work with regex', () => {
    it('auth skipped', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: JwtMiddlewareConfig = {
        ...jwtMiddlewareConfig,
        ignore: [/^\/.*/u],
      }
      app.addConfigObject({ jwtMiddlewareConfig: mwConfig })

      const resp = await httpRequest
        .get(path)
      authShouldSkipped(resp)
    })

  })
})

