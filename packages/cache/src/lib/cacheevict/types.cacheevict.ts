import { CacheManager } from '@midwayjs/cache'
import type { Context as WebContext } from '@mwcp/share'

import { CacheEvictArgs } from '../types'


export interface DecoratorExecutorOptions extends CacheEvictArgs {
  cacheManager: CacheManager
  method: (...args: unknown[]) => unknown
  methodArgs: unknown[]
  methodResult?: unknown
  webContext: WebContext
}

