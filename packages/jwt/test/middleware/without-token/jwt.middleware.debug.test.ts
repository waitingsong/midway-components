import { relative } from 'path'

import {
  authShouldFailedWithNotFoundFromDebug,
  authShouldPassthroughNotFound,
} from '../helper'

import { testConfig } from '@/root.config'
import {
  initialJwtMiddlewareConfig,
  JwtMiddlewareConfig,
} from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('Should JwtMiddlewareConfig.debug work true', () => {
    it('normal', async () => {
      const { app, httpRequest } = testConfig
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
        debug: true,
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const resp = await httpRequest
        .get('/')
      authShouldFailedWithNotFoundFromDebug(resp)
    })

    it('ignored with passthrough:true', async () => {
      const { app, httpRequest } = testConfig
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
        debug: true,
        passthrough: true,
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const resp = await httpRequest
        .get('/')
      authShouldPassthroughNotFound(resp)
    })
  })
})

