import { App, Configuration, Inject, MidwayDecoratorService } from '@midwayjs/core'
import {
  registerDecoratorHandler,
  Application,
  AroundFactoryParamBase,
  RegisterDecoratorHandlerParam,
} from '@mwcp/share'

import * as SRC from '../../../../dist/index.js'

import {
  METHOD_KEY_Cacheable,
  METHOD_KEY_Cacheable_Sync,
  METHOD_KEY_Cacheable_Sync_with_async_bypass,
  decoratorExecutorAsync,
  decoratorExecutorSync,
  genDecoratorExecutorOptions,
} from './helper.js'


@Configuration({
  imports: [SRC],
})
export class AutoConfiguration {

  @App() readonly app: Application
  @Inject() decoratorService: MidwayDecoratorService

  async onReady(): Promise<void> {
    // const foo = this.app.getConfig() as unknown
    // void foo

    const aroundFactoryOptions: AroundFactoryParamBase = {
      webApp: this.app,
    }
    const base = {
      decoratorService: this.decoratorService,
      fnGenDecoratorExecutorParam: genDecoratorExecutorOptions,
    } as const

    const optsCacheable: RegisterDecoratorHandlerParam = {
      ...base,
      decoratorKey: METHOD_KEY_Cacheable,
      fnDecoratorExecutorAsync: decoratorExecutorAsync,
      fnDecoratorExecutorSync: decoratorExecutorSync,
    }
    registerDecoratorHandler(optsCacheable, aroundFactoryOptions)


    const optsCacheableSyncWithAsyncBypass: RegisterDecoratorHandlerParam = {
      ...base,
      decoratorKey: METHOD_KEY_Cacheable_Sync_with_async_bypass,
      fnDecoratorExecutorAsync: 'bypass',
      fnDecoratorExecutorSync: decoratorExecutorSync,
    }
    registerDecoratorHandler(optsCacheableSyncWithAsyncBypass, aroundFactoryOptions)


    const optsCacheableAsyncFalse: RegisterDecoratorHandlerParam = {
      ...base,
      decoratorKey: METHOD_KEY_Cacheable_Sync,
      fnDecoratorExecutorAsync: false,
      fnDecoratorExecutorSync: decoratorExecutorSync,
    }
    registerDecoratorHandler(optsCacheableAsyncFalse, aroundFactoryOptions)
  }

}
