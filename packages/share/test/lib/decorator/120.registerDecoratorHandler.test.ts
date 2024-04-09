/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import assert from 'node:assert/strict'

import { MidwayDecoratorService } from '@midwayjs/core'
import { fileShortPath } from '@waiting/shared-core'

import {
  AroundFactoryParamBase,
  DecoratorExecutorParamBase,
  RegisterDecoratorHandlerParam,
  registerDecoratorHandler,
} from '##/index.js'
import { apiPrefix, apiRoute } from '#@/api-route.js'
import { testConfig } from '#@/root.config.js'

import { METHOD_KEY_Cacheable, Test, Test2, TestClass, TestClass2, CacheableArgs } from './111.custom-decorator.helper.js'


describe(fileShortPath(import.meta.url), () => {

  describe(`Should registerDecoratorHandler() work`, () => {
    it(`normal`, async () => {
      const { app, container } = testConfig

      const aroundFactoryOptions: AroundFactoryParamBase = {
        webApp: app,
      }
      const decoratorService = new MidwayDecoratorService(container)

      const base = {
        decoratorService: decoratorService,
        fnGenDecoratorExecutorParam: genDecoratorExecutorOptions,
        fnDecoratorExecutorSync: false,
      } as const

      const optsCacheable: RegisterDecoratorHandlerParam = {
        ...base,
        decoratorKey: METHOD_KEY_Cacheable,
        fnDecoratorExecutorAsync: decoratorExecutor,
      }
      registerDecoratorHandler(optsCacheable, aroundFactoryOptions)

      const test = new Test()
      const ret = await test._simple()
      assert(ret === 'simple')
      const ret2 = await test._simple()
      assert(ret2 === 'simple')
    })
  })

  it(apiRoute.simple, async () => {
    const { httpRequest } = testConfig
    const url = `${apiPrefix.methodCacheable}/${apiRoute.simple}`

    const resp = await httpRequest
      .get(url)
      .expect(200)

    assert(resp)
    const data = resp.body as number
    assert(data === 2)
  })

  it(apiRoute.simpleSyncWithAsyncBypass, async () => {
    const { httpRequest } = testConfig
    const url = `${apiPrefix.methodCacheable}/${apiRoute.simpleSyncWithAsyncBypass}`

    const resp = await httpRequest
      .get(url)
      .expect(200)

    assert(resp)
    const data = resp.body as number
    assert(data === 2)
  })

  it(apiRoute.simpleSyncOnly, async () => {
    const { httpRequest } = testConfig
    const url = `${apiPrefix.methodCacheable}/${apiRoute.simpleSyncOnly}`

    const resp = await httpRequest
      .get(url)
      .expect(200)

    assert(resp)
    const data = resp.body as number
    assert(data === 2)
  })
})



async function decoratorExecutor(): Promise<unknown> {
  return 'decoratorExecutor'
}

function genDecoratorExecutorOptions(options: DecoratorExecutorParamBase<CacheableArgs>): DecoratorExecutorParamBase<CacheableArgs> {
  return options
}

