import { relative } from 'path'

import {
  authShouldPassed,
  authShouldSkipped,
  authShouldValidatFailed,
} from '../helper'

import { authHeader1, payload1 } from '@/mock-data'
import { testConfig } from '@/root.config'
import { jwtMiddlewareConfig as mConfig } from '~/config/config.unittest'
import { ConfigKey, MiddlewareConfig } from '~/lib/types'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  const path = '/test'

  describe('Should JwtComponent.validateToken() work with header', () => {
    it('auth skipped', async () => {
      const { app, httpRequest } = testConfig
      // @ts-ignore
      const mwConfig: MiddlewareConfig = {
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

