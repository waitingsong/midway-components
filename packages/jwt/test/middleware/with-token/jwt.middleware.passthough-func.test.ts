import { relative } from 'path'

import {
  authShouldFailedWithNotFound,
  authShouldFailedWithNotFound2,
  authShouldPassed,
  authShouldPassthroughNotFound,
} from '../helper'

import { testConfig } from '@/root.config'
import {
  authHeader1, payload1,
  mwConfigNoOpts,
  mwOptions,
} from '@/test.config'
import {
  ConfigKey,
  MiddlewareConfig,
  passthroughCallback,
} from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  const cb: passthroughCallback = async () => true
  const path = '/test'

  describe('Should JwtAuthenticateOptions.passthrough work with func', () => {
    it('true: passed', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        ...mwConfigNoOpts,
        options: {
          ...mwOptions,
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
        ...mwConfigNoOpts,
        options: {
          ...mwOptions,
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
        ...mwConfigNoOpts,
        options: {
          ...mwOptions,
          // @ts-expect-error
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
        ...mwConfigNoOpts,
        options: {
          ...mwOptions,
          // @ts-expect-error
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

