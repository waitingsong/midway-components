import { relative } from 'path'

import {
  authShouldPassthroughEmptyStringNotFound,
  authShouldRedirect,
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

  describe('Should JwtAuthenticateOptions.passthrough work with value string', () => {
    it('valid url', async () => {
      const { app, httpRequest } = testConfig
      const path2 = '/redirect-' + Math.random().toString()
      const mwConfig: JwtMiddlewareConfig = {
        ...jwtMiddlewareConfigNoOpts,
        options: {
          ...jwtMiddlewareOptions,
          passthrough: path2,
        },
      }
      app.addConfigObject({ jwtMiddlewareConfig: mwConfig })

      const resp = await httpRequest
        .get(path)
      authShouldRedirect(resp, path2)
    })

    it('empty string', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: JwtMiddlewareConfig = {
        ...jwtMiddlewareConfigNoOpts,
        options: {
          ...jwtMiddlewareOptions,
          passthrough: '',
        },
      }
      app.addConfigObject({ jwtMiddlewareConfig: mwConfig })

      const resp = await httpRequest
        .get(path)
      authShouldPassthroughEmptyStringNotFound(resp, 401)
    })
  })
})

