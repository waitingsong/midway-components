import { relative } from 'path'

import {
  authShouldPassed,
  authShouldPassthroughNotFound,
  authShouldPassthroughValidFailed,
} from '../helper'

import {
  authHeader1, payload1,
  mwConfigNoOpts,
  mwOptions,
} from '@/config.unittest'
import { testConfig } from '@/root.config'
import { ConfigKey, MiddlewareConfig } from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  const path = '/test'

  describe('Should JwtAuthenticateOptions.passthrough work with value: true', () => {
    it('passed', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        ...mwConfigNoOpts,
        options: {
          ...mwOptions,
          passthrough: true,
        },
      }
      app.addConfigObject({ [ConfigKey.middlewareConfig]: mwConfig })

      const sendHeader = {
        authorization: authHeader1,
      }
      const resp = await httpRequest
        .get(path)
        .set(sendHeader)
      authShouldPassed(resp, payload1)
    })

    it('token not found', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        ...mwConfigNoOpts,
        options: {
          ...mwOptions,
          passthrough: true,
        },
      }
      app.addConfigObject({ [ConfigKey.middlewareConfig]: mwConfig })

      const sendHeader = {
        authorization: '',
      }
      const resp = await httpRequest
        .get(path)
      authShouldPassthroughNotFound(resp)
    })

    it('token valid faied', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        ...mwConfigNoOpts,
        options: {
          ...mwOptions,
          passthrough: true,
        },
      }
      app.addConfigObject({ [ConfigKey.middlewareConfig]: mwConfig })

      const sendHeader = {
        authorization: authHeader1 + 'FAKE',
      }
      const resp = await httpRequest
        .get(path)
        .set(sendHeader)
      authShouldPassthroughValidFailed(resp)
    })
  })
})

