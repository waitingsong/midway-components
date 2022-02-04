import { relative } from 'path'

import { authShouldPassed } from '../helper'

import { testConfig } from '@/root.config'
import { authHeader1, payload1, secret, token1 } from '@/test.config'
import {
  initialJwtMiddlewareConfig,
  JwtConfig,
  JwtMiddlewareConfig,
} from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('Should JwtComponent.validateToken() work with scret from ctx', () => {
    const jwtConfig: JwtConfig = {
      secret: 'FAKE',
    }

    it('passed with ctx.jwtState.secret', async () => {
      const { app, httpRequest } = testConfig
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
      }
      app.addConfigObject({ jwtConfig, jwtMiddlewareConfig })

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
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
      }
      app.addConfigObject({ jwtConfig, jwtMiddlewareConfig })

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

