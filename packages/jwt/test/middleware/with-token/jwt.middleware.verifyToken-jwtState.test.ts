import { relative } from 'path'

import { authShouldPassed } from '../helper'

import { testConfig } from '@/root.config'
import {
  authHeader1, payload1,
  jwtMiddlewareConfig, jwtMiddlewareOptions,
} from '@/test.config'
import {
  Config,
  JwtMiddlewareConfig,
} from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('Should JwtComponent.validateToken() work with scret from ctx', () => {
    const jwtConfig: Config = {
      secret: 'FAKE',
    }

    it('passed with ctx.jwtState.secret', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: JwtMiddlewareConfig = {
        ...jwtMiddlewareConfig,
      }
      app.addConfigObject({
        jwtConfig,
        jwtMiddlewareConfig: mwConfig,
      })

      const sendHeader = {
        authorization: authHeader1,
      }
      const resp = await httpRequest
        .get('/')
        .set(sendHeader)
      authShouldPassed(resp, payload1)
    })

    it('passed with ctx.state.secret', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: JwtMiddlewareConfig = {
        ...jwtMiddlewareConfig,
      }
      app.addConfigObject({
        jwtConfig,
        jwtMiddlewareConfig: mwConfig,
      })

      const sendHeader = {
        authorization: authHeader1,
      }
      const resp = await httpRequest
        .get('/')
        .set(sendHeader)
      authShouldPassed(resp, payload1)
    })

  })
})

