import {
  App,
  Autoload,
  MidwayDecoratorService,
  Init,
  Inject,
  Singleton,
} from '@midwayjs/core'
import {
  registerDecoratorHandlers,
  Application,
} from '@mwcp/share'

import { METHOD_KEY_TraceInit, KEY_Trace } from './config.js'


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

