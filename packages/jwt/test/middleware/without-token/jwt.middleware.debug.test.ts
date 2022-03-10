import { relative } from 'path'

import {
  authShouldFailedWithNotFoundFromDebug,
  authShouldPassthroughNotFound,
} from '../helper'

import { testConfig } from '@/root.config'
import {
  jwtMiddlewareConfig,
  jwtMiddlewareConfigNoOpts,
  jwtMiddlewareOptions,
} from '@/test.config'
import { JwtMiddlewareConfig } from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  const path = '/test'

  describe('Should JwtMiddlewareConfig.debug work true', () => {
    it('normal', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: JwtMiddlewareConfig = {
        ...jwtMiddlewareConfigNoOpts,
        options: {
          ...jwtMiddlewareOptions,
          debug: true,
        },
      }
      app.addConfigObject({ jwtMiddlewareConfig: mwConfig })

      const resp = await httpRequest
        .get(path)
      authShouldFailedWithNotFoundFromDebug(resp)
    })

    it('ignored with passthrough:true', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: JwtMiddlewareConfig = {
        ...jwtMiddlewareConfigNoOpts,
        options: {
          ...jwtMiddlewareOptions,
          debug: true,
          passthrough: true,
        },
      }
      app.addConfigObject({ jwtMiddlewareConfig: mwConfig })

      const resp = await httpRequest
        .get(path)
      authShouldPassthroughNotFound(resp)
    })
  })
})

