import { App, Configuration, Inject, MidwayDecoratorService } from '@midwayjs/core'
import { Application } from '@mwcp/share'

import * as SRC from '../../../../src/index.js'


@Configuration({
  imports: [SRC],
})
export class AutoConfiguration {

  @App() readonly app: Application
  @Inject() decoratorService: MidwayDecoratorService

  async onReady(): Promise<void> {
    // const foo = this.app.getConfig() as unknown
    // void foo
  }

}
