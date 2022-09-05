import { relative } from 'path'

import {
  authShouldFailedWithNotFoundFromDebug,
  authShouldPassthroughNotFound,
} from '../helper'

import { testConfig } from '@/root.config'
import { ConfigKey, MiddlewareConfig } from '~/lib/types'


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')

describe(filename, () => {

  const path = '/test'

  describe('Should MiddlewareConfig.debug work true', () => {
    it('normal', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        // @ts-ignore
        options: {
          debug: true,
        },
      }
      app.addConfigObject({ [ConfigKey.middlewareConfig]: mwConfig })

      const resp = await httpRequest
        .get(path)
      authShouldFailedWithNotFoundFromDebug(resp)
    })

    it('ignored with passthrough:true', async () => {
      const { app, httpRequest } = testConfig
      const mwConfig: MiddlewareConfig = {
        // @ts-ignore
        options: {
          debug: true,
          passthrough: true,
        },
      }
      app.addConfigObject({ [ConfigKey.middlewareConfig]: mwConfig })

      const resp = await httpRequest
        .get(path)
      authShouldPassthroughNotFound(resp)
    })
  })
})

