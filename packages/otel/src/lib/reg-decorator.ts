import {
  App,
  Autoload,
  Init,
  Inject,
  MidwayDecoratorService,
  Singleton,
} from '@midwayjs/core'
import {
  Application,
  registerDecoratorHandlers,
} from '@mwcp/share'

import { KEY_Trace, METHOD_KEY_TraceInit } from './config.js'


/** Auto register trace decorator */
@Autoload()
@Singleton()
export class AutoRegister {
  @App() protected readonly app: Application

  @Inject() protected readonly decoratorService: MidwayDecoratorService

  @Init()
  async init(): Promise<void> {
    await registerDecoratorHandlers(this.app, this.decoratorService, [METHOD_KEY_TraceInit, KEY_Trace])
  }
}

