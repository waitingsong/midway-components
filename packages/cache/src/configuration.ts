import 'tsconfig-paths/register'
import { join } from 'node:path'

import { CacheManager } from '@midwayjs/cache'
import {
  Config, Configuration,
  Inject, ILifeCycle,
  MidwayDecoratorService,
} from '@midwayjs/core'
// import type { Application } from '@mwcp/share'

import { useComponents } from './imports'
import { registerMethodHandler } from './lib/cacheable/method-decorator.cacheable'
import { registerMethodHandlerEvict } from './lib/cacheevict/method-decorator.cacheevict'
import { ConfigKey, Config as CacheConfig } from './lib/index'


@Configuration({
  namespace: ConfigKey.namespace,
  importConfigs: [join(__dirname, 'config')],
  imports: useComponents,
})
export class AutoConfiguration implements ILifeCycle {

  // @App() readonly app: Application

  @Config(ConfigKey.config) protected readonly config: CacheConfig

  @Inject() decoratorService: MidwayDecoratorService
  @Inject() cacheManager: CacheManager


  async onReady(): Promise<void> {
    registerMethodHandler(
      this.decoratorService,
      this.config,
      this.cacheManager,
    )
    registerMethodHandlerEvict(
      this.decoratorService,
      this.config,
      this.cacheManager,
    )
  }

}


// function registerMiddleware(
//   app: Application,
//   middleware: { name: string },
//   postion: 'first' | 'last' = 'last',
// ): void {

//   const mwNames = app.getMiddleware().getNames()
//   if (mwNames.includes(middleware.name)) {
//     return
//   }

//   switch (postion) {
//     case 'first':
//       // @ts-ignore
//       app.getMiddleware().insertFirst(middleware)
//       break
//     case 'last':
//       // @ts-ignore
//       app.getMiddleware().insertLast(middleware)
//       break
//   }
// }


