import { relative } from 'path'

import {
  authShouldPassthroughEmptyStringNotFound,
  authShouldRedirect,
} from '../helper'

import {
  mwConfigNoOpts,
  mwOptions,
} from '@/config.unittest'
import { testConfig } from '@/root.config'
import { ConfigKey, MiddlewareConfig } from '~/index'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  const path = '/test'

  describe('Should JwtAuthenticateOptions.passthrough work with value string', () => {
    it('valid url', async () => {
      const { app, httpRequest } = testConfig
      const path2 = '/redirect-' + Math.random().toString()
      const mwConfig: MiddlewareConfig = {
        ...mwConfigNoOpts,
        options: {
          ...mwOptions,
          passthrough: path2,
        },
      }
      app.addConfigObject({
        [ConfigKey.middlewareConfig]: mwConfig,
      })

      const resp = await httpRequest
        .get(path)
      authShouldRedirect(resp, path2)
    })

    it('empty string', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        ...mwConfigNoOpts,
        options: {
          ...mwOptions,
          passthrough: '',
        },
      }
      app.addConfigObject({
        [ConfigKey.middlewareConfig]: mwConfig,
      })

      const resp = await httpRequest
        .get(path)
      authShouldPassthroughEmptyStringNotFound(resp, 401)
    })
  })
})

