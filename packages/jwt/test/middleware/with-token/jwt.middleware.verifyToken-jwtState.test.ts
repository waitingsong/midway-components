import { relative } from 'path'

import { authShouldPassed } from '../helper'

import {
  authHeader1, payload1,
  mwConfig as mConfig,
} from '@/config.unittest'
import { testConfig } from '@/root.config'
import {
  Config,
  ConfigKey,
  MiddlewareConfig,
} from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  const path = '/test'

  describe('Should JwtComponent.validateToken() work with scret from ctx', () => {
    const config: Config = {
      secret: 'FAKE',
    }

    it('passed with ctx.jwtState.secret', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        ...mConfig,
      }
      app.addConfigObject({
        [ConfigKey.config]: config,
        [ConfigKey.middlewareConfig]: mwConfig,
      })

      const sendHeader = {
        authorization: authHeader1,
      }
      const resp = await httpRequest
        .get(path)
        .set(sendHeader)
      authShouldPassed(resp, payload1)
    })

    it('passed with ctx.state.secret', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        ...mConfig,
      }
      app.addConfigObject({
        [ConfigKey.config]: config,
        [ConfigKey.middlewareConfig]: mwConfig,
      })

      const sendHeader = {
        authorization: authHeader1,
      }
      const resp = await httpRequest
        .get(path)
        .set(sendHeader)
      authShouldPassed(resp, payload1)
    })

  })
})

