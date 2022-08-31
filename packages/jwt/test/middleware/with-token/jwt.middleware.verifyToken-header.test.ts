import { relative } from 'path'

import {
  authShouldPassed,
  authShouldSkipped,
  authShouldValidatFailed,
} from '../helper'

import {
  authHeader1, payload1,
  mwConfig as mConfig,
} from '@/config.unittest'
import { testConfig } from '@/root.config'
import { ConfigKey, MiddlewareConfig } from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  const path = '/test'

  describe('Should JwtComponent.validateToken() work with header', () => {
    it('auth skipped', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        ...mConfig,
        ignore: [path],
      }
      app.addConfigObject({
        [ConfigKey.middlewareConfig]: mwConfig,
      })

      const sendHeader = {
        authorization: authHeader1,
      }
      const resp = await httpRequest
        .get(path)
        .set(sendHeader)
      authShouldSkipped(resp)
    })

    it('auth testing passed', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        ...mConfig,
      }
      app.addConfigObject({
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

    it('auth validation failed', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        ...mConfig,
      }
      app.addConfigObject({
        [ConfigKey.middlewareConfig]: mwConfig,
      })

      const sendHeader = {
        authorization: authHeader1 + 'fake',
      }
      const resp = await httpRequest
        .get(path)
        .set(sendHeader)
      authShouldValidatFailed(resp)
    })
  })
})

