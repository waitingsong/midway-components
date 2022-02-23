import { relative } from 'path'

import {
  authShouldPassthroughEmptyStringNotFound,
  authShouldRedirect,
} from '../helper'

import { testConfig } from '@/root.config'
import {
  initialJwtMiddlewareConfig,
  JwtMiddlewareConfig,
} from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('Should JwtAuthenticateOptions.passthrough work with value string', () => {
    it('valid url', async () => {
      const { app, httpRequest } = testConfig
      const path = '/' + Math.random().toString()
      const path2 = '/redirect-' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
        passthrough: path2,
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const resp = await httpRequest
        .get('/')
      authShouldRedirect(resp, path2)
    })

    it('empty string', async () => {
      const { app, httpRequest } = testConfig
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
        passthrough: '',
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const resp = await httpRequest
        .get('/')
      authShouldPassthroughEmptyStringNotFound(resp, 401)
    })
  })
})

