import { CacheManager } from '@midwayjs/cache'
import type { Context as WebContext } from '@mwcp/share'

import { CacheableArgs } from '../types'


export interface DecoratorExecutorOptions extends CacheableArgs {
  cacheManager: CacheManager
  method: (...args: unknown[]) => unknown
  methodArgs: unknown[]
  webContext: WebContext
}


