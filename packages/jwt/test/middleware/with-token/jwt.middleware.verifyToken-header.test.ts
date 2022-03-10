import { relative } from 'path'

import {
  authShouldPassed,
  authShouldSkipped,
  authShouldValidatFailed,
} from '../helper'

import { testConfig } from '@/root.config'
import {
  authHeader1, payload1,
  jwtMiddlewareConfig, jwtMiddlewareOptions,
} from '@/test.config'
import { JwtMiddlewareConfig } from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('Should JwtComponent.validateToken() work with header', () => {
    it('auth skipped', async () => {
      const { app, httpRequest } = testConfig
      const path = '/'
      const mwConfig: JwtMiddlewareConfig = {
        ...jwtMiddlewareConfig,
        ignore: [path],
      }
      app.addConfigObject({ jwtMiddlewareConfig: mwConfig })

      const sendHeader = {
        authorization: authHeader1,
      }
      const resp = await httpRequest
        .get('/')
        .set(sendHeader)
      authShouldSkipped(resp)
    })

    it('auth testing passed', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: JwtMiddlewareConfig = {
        ...jwtMiddlewareConfig,
      }
      app.addConfigObject({ jwtMiddlewareConfig: mwConfig })

      const sendHeader = {
        authorization: authHeader1,
      }
      const resp = await httpRequest
        .get('/')
        .set(sendHeader)
      authShouldPassed(resp, payload1)
    })

    it('auth validation failed', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: JwtMiddlewareConfig = {
        ...jwtMiddlewareConfig,
      }
      app.addConfigObject({ jwtMiddlewareConfig: mwConfig })

      const sendHeader = {
        authorization: authHeader1 + 'fake',
      }
      const resp = await httpRequest
        .get('/')
        .set(sendHeader)
      authShouldValidatFailed(resp)
    })
  })
})

