/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import assert from 'node:assert/strict'

// import { CachingFactory } from '@midwayjs/cache-manager'
import { MidwayDecoratorService } from '@midwayjs/core'
import { fileShortPath } from '@waiting/shared-core'

import {
  AroundFactoryParamBase,
  DecoratorExecutorParamBase,
  RegisterDecoratorHandlerParam,
  registerDecoratorHandler,
} from '##/index.js'
import { testConfig } from '#@/root.config.js'

import { METHOD_KEY_Cacheable, ttl, Test, Test2, TestClass, TestClass2, CacheableArgs } from './111.custom-decorator.helper.js'


describe(fileShortPath(import.meta.url), () => {

  describe(`Should registerDecoratorHandler() work`, () => {
    it(`normal`, async () => {
      const { app, container } = testConfig

      const aroundFactoryOptions: AroundFactoryParamBase = {
        webApp: app,
        // cachingFactory: new CachingFactory(),
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

})


async function decoratorExecutor(): Promise<unknown> {
  return 'decoratorExecutor'
}

function genDecoratorExecutorOptions(options: DecoratorExecutorParamBase<CacheableArgs>): DecoratorExecutorParamBase<CacheableArgs> {
  return options

}

