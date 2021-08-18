import { relative } from 'path'

import { IMidwayKoaNext } from '@midwayjs/koa'
import { MidwayWebMiddleware } from '@midwayjs/web'

import { testConfig } from '../root.config'
import { secret } from '../test.config'

import {
  Context,
  initialJwtMiddlewareConfig,
  JwtConfig,
  JwtMiddlewareConfig,
  JwtMsg,
} from '~/index'
import { JwtMiddleware } from '~/middleware/jwt.middleware'

// eslint-disable-next-line import/order
import assert = require('power-assert')
// eslint-disable-next-line import/order
import rewire = require('rewire')


const filename = relative(process.cwd(), __filename).replace(/\\/ug, '/')
const next: IMidwayKoaNext = async () => { return }

describe(filename, () => {

  describe('Should JwtMiddlewareConfig.ignore work with string', () => {
    it('path matched', async () => {
      const { app } = testConfig
      const jwtConfig: JwtConfig = {
        secret,
      }
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: ['/'],
      }
      app.addConfigObject({ jwtConfig, jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      // const svc = await container.getAsync(JwtComponent)
      const inst = await container.getAsync(JwtMiddleware)

      const ctx: Context = app.createAnonymousContext()
      ctx.path = '/'

      const mw = inst.resolve() as MidwayWebMiddleware
      // @ts-expect-error
      await mw(ctx, next)
      const { status } = ctx
      assert(status === 200)
    })

    it('path ignored', async () => {
      const { app } = testConfig
      const jwtConfig: JwtConfig = {
        secret,
      }
      const jwtMiddlewareConfig: JwtMiddlewareConfig = {
        ...initialJwtMiddlewareConfig,
        ignore: [],
      }
      app.addConfigObject({ jwtConfig, jwtMiddlewareConfig })

      const container = app.getApplicationContext()
      const inst = await container.getAsync(JwtMiddleware)

      const ctx: Context = app.createAnonymousContext()
      ctx.path = '/'

      const mw = inst.resolve() as MidwayWebMiddleware
      try {
        // @ts-expect-error
        await mw(ctx, next)
      }
      catch (ex) {
        assert(ctx.status === 401)

        const msg = (ex as Error).message
        assert(msg.includes(JwtMsg.AuthFailed))

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const omsg = (ex.originalError as Error).message
        assert(omsg.includes(JwtMsg.TokenNotFound))
        return
      }
      assert(false, 'should throw error 401, but not.')
    })
  })
})

