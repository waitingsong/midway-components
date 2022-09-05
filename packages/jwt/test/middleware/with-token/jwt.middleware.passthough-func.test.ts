import { relative } from 'path'

import {
  authShouldFailedWithNotFound2,
  authShouldPassed,
  authShouldPassthroughNotFound,
} from '../helper'

import { authHeader1, payload1 } from '@/mock-data'
import { testConfig } from '@/root.config'
import {
  ConfigKey,
  MiddlewareConfig,
  PassthroughCallback,
} from '~/lib/types'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  const cb: PassthroughCallback = async () => true
  const path = '/test'

  describe('Should JwtAuthenticateOptions.passthrough work with func', () => {
    it('true: passed', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        // @ts-ignore
        options: {
          passthrough: cb,
        },
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

    it('true: token not found', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        // @ts-ignore
        options: {
          passthrough: cb,
        },
      }
      app.addConfigObject({
        [ConfigKey.middlewareConfig]: mwConfig,
      })

      const resp = await httpRequest
        .get(path)
      authShouldPassthroughNotFound(resp, 200)
    })

    it('invalid value: token not found', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        options: {
          // @ts-ignore
          passthrough: 0,
        },
      }
      app.addConfigObject({
        [ConfigKey.middlewareConfig]: mwConfig,
      })

      const resp = await httpRequest
        .get(path)
      authShouldFailedWithNotFound2(resp, 401)
    })

    it('invalid value 1: token not found', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        options: {
          // @ts-ignore
          passthrough: 1,
        },
      }
      app.addConfigObject({
        [ConfigKey.middlewareConfig]: mwConfig,
      })

      const resp = await httpRequest
        .get(path)
      authShouldFailedWithNotFound2(resp, 401)
    })
  })
})

