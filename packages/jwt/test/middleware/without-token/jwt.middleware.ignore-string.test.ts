import { relative } from 'path'

import { authShouldFailedWithNotFound, authShouldSkipped } from '../helper'

import { testConfig } from '@/root.config'
import {
  initialJwtMiddlewareConfig,
  JwtMiddlewareConfig,
} from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('Should JwtMiddlewareConfig.ignore work with string', () => {
    it('auth skipped', async () => {
      const { app, httpRequest } = testConfig
      const path = '/'
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [path],
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const resp = await httpRequest
        .get('/')
      authShouldSkipped(resp)
    })

    it('auth skipped with empty ignore', async () => {
      const { app, httpRequest } = testConfig
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const resp = await httpRequest
        .get('/')
      authShouldFailedWithNotFound(resp)
    })

    it('auth skipped with random ignore', async () => {
      const { app, httpRequest } = testConfig
      const path = '/' + Math.random().toString()
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: ['/' + Math.random().toString()],
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const resp = await httpRequest
        .get('/')
      authShouldFailedWithNotFound(resp)
    })

    it('auth skipped mixed with invalid value', async () => {
      const { app, httpRequest } = testConfig
      const path = '/'
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        // @ts-expect-error
        ignore: [false, '', path],
      }
      app.addConfigObject({ jwtMiddlewareConfig })

      const resp = await httpRequest
        .get('/')
      authShouldSkipped(resp)
    })

  })
})

