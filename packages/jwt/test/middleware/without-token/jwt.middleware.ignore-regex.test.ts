import { relative } from 'path'

import { authShouldFailedWithNotFound, authShouldSkipped } from '../helper'

import { testConfig, TestResponse } from '@/root.config'
import {
  initialJwtMiddlewareConfig,
  JwtMiddlewareConfig,
} from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('Should JwtMiddlewareConfig.ignore work with regex', () => {
    it('auth skipped', async () => {
      const { app, httpRequest } = testConfig
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [/^\/.+/u],
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const resp = await httpRequest
        .get('/') as TestResponse
      await authShouldSkipped(resp)
    })

    it('auth skipped2', async () => {
      const { app, httpRequest } = testConfig
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [/\w+/u],
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const resp = await httpRequest
        .get('/') as TestResponse
      await authShouldSkipped(resp)
    })

    it('auth testing 1', async () => {
      const { app, httpRequest } = testConfig
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [/^\/$/u],
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const resp = await httpRequest
        .get('/') as TestResponse
      await authShouldFailedWithNotFound(resp)
    })

    it('auth testing 2', async () => {
      const { app, httpRequest } = testConfig
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [/^\/$/u],
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const resp = await httpRequest
        .get('/') as TestResponse
      await authShouldFailedWithNotFound(resp)
    })
  })
})

