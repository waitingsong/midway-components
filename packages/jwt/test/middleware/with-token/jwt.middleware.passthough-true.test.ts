import { relative } from 'path'

import {
  authShouldPassed,
  authShouldPassthroughNotFound,
  authShouldPassthroughValidFailed,
} from '../helper'

import { testConfig } from '@/root.config'
import {
  authHeader1, payload1,
  jwtMiddlewareConfig,
  jwtMiddlewareConfigNoOpts,
  jwtMiddlewareOptions,
} from '@/test.config'
import { JwtMiddlewareConfig } from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  describe('Should JwtAuthenticateOptions.passthrough work with value: true', () => {
    it('passed', async () => {
      const { app, httpRequest } = testConfig
      const path = '/' + Math.random().toString()
      const mwConfig: JwtMiddlewareConfig = {
        ...jwtMiddlewareConfigNoOpts,
        options: {
          ...jwtMiddlewareOptions,
          passthrough: true,
        },
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

    it('token not found', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: JwtMiddlewareConfig = {
        ...jwtMiddlewareConfigNoOpts,
        options: {
          ...jwtMiddlewareOptions,
          passthrough: true,
        },
      }
      app.addConfigObject({ jwtMiddlewareConfig: mwConfig })

      const sendHeader = {
        authorization: '',
      }
      const resp = await httpRequest
        .get('/')
      authShouldPassthroughNotFound(resp)
    })

    it('token valid faied', async () => {
      const { app, httpRequest } = testConfig
      const path = '/' + Math.random().toString()
      const mwConfig: JwtMiddlewareConfig = {
        ...jwtMiddlewareConfigNoOpts,
        options: {
          ...jwtMiddlewareOptions,
          passthrough: true,
        },
      }
      app.addConfigObject({ jwtMiddlewareConfig: mwConfig })

      const sendHeader = {
        authorization: authHeader1 + 'FAKE',
      }
      const resp = await httpRequest
        .get('/')
        .set(sendHeader)
      authShouldPassthroughValidFailed(resp)
    })
  })
})

