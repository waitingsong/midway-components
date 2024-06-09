/* eslint-disable @typescript-eslint/await-thenable */
import assert from 'assert'

import { Singleton } from '@midwayjs/core'
import { MConfig } from '@mwcp/share'

import { Trace } from '../types/index.js'
import { Config, ConfigKey } from '../types/lib-types.js'


@Singleton()
export class TraceSingletonService {

  @MConfig(ConfigKey.config) readonly config: Config

  @Trace<TraceSingletonService['hello2']>({
    before: (_input, decoratorContext) => {
      assert(decoratorContext)
      assert(decoratorContext.webContext)
      assert(typeof decoratorContext.webContext.getApp === 'function')
      assert(decoratorContext.traceService)
      return void 0
    },
    after: (_input, _res, decoratorContext) => {
      assert(decoratorContext)
      assert(decoratorContext.webContext)
      assert(typeof decoratorContext.webContext.getApp === 'function')
      assert(decoratorContext.traceService)
      return void 0
    },
  })
  async hello2(input: string): Promise<string> {
    const ret = await input
    return ret
  }
}

