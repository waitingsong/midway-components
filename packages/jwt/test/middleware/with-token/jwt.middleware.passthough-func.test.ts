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
  jwtMiddlewareConfig,
  jwtMiddlewareConfigNoOpts,
  jwtMiddlewareOptions,
} from '@/test.config'
import {
  JwtMiddlewareConfig,
  passthroughCallback,
} from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  const cb: passthroughCallback = async () => true
  const path = '/'

  describe('Should JwtAuthenticateOptions.passthrough work with func', () => {
    it.only('true: passed', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: JwtMiddlewareConfig = {
        ...jwtMiddlewareConfigNoOpts,
        options: {
          ...jwtMiddlewareOptions,
          passthrough: cb,
        },
      }
      app.addConfigObject({ jwtMiddlewareConfig: mwConfig })

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
      const mwConfig: JwtMiddlewareConfig = {
        ...jwtMiddlewareConfigNoOpts,
        options: {
          ...jwtMiddlewareOptions,
          passthrough: cb,
        },
      }
      app.addConfigObject({ jwtMiddlewareConfig: mwConfig })

      const resp = await httpRequest
        .get(path)
      authShouldPassthroughNotFound(resp, 200)
    })

    it('invalid value: token not found', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: JwtMiddlewareConfig = {
        ...jwtMiddlewareConfigNoOpts,
        options: {
          ...jwtMiddlewareOptions,
          // @ts-expect-error
          passthrough: 0,
        },
      }
      app.addConfigObject({ jwtMiddlewareConfig: mwConfig })

      const resp = await httpRequest
        .get(path)
      authShouldFailedWithNotFound2(resp, 401)
    })

    it('invalid value 1: token not found', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: JwtMiddlewareConfig = {
        ...jwtMiddlewareConfigNoOpts,
        options: {
          ...jwtMiddlewareOptions,
          // @ts-expect-error
          passthrough: 1,
        },
      }
      app.addConfigObject({ jwtMiddlewareConfig: mwConfig })

      const resp = await httpRequest
        .get(path)
      authShouldFailedWithNotFound2(resp, 401)
    })
  })
})

