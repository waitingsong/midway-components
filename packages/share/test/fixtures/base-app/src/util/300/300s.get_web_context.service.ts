import { Singleton, ApplicationContext, IMidwayContainer } from '@midwayjs/core'

import { type Context, getWebContext } from '../../types/index.js'


@Singleton()
export class FullService {
  @ApplicationContext() readonly applicationContext: IMidwayContainer

  hello(): Context | undefined {
    const ret = getWebContext(this.applicationContext)
    return ret
  }

}

