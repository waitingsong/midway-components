import { relative } from 'path'

import {
  authShouldFailedWithNotFoundFromDebug,
  authShouldPassthroughNotFound,
} from '../helper'

import { testConfig, TestResponse } from '@/root.config'
import {
  Context,
  initialJwtMiddlewareConfig,
  JwtMiddlewareConfig,
} from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('Should JwtMiddlewareConfig.debug work true', () => {
    it('normal', async () => {
      const { app, httpRequest } = testConfig
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
        debug: true,
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const sendHeader = {
        authorization: '',
      }
      const resp = await httpRequest
        .get('/')
        .set(sendHeader) as TestResponse
      await authShouldFailedWithNotFoundFromDebug(resp)
    })

    it('ignored with passthrough:true', async () => {
      const { app, httpRequest } = testConfig
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
        debug: true,
        passthrough: true,
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const sendHeader = {
        authorization: '',
      }
      const resp = await httpRequest
        .get('/')
        .set(sendHeader) as TestResponse
      await authShouldPassthroughNotFound(resp)
    })
  })
})

