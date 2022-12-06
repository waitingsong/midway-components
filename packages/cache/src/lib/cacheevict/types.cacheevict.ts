/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CacheManager } from '@midwayjs/cache'
import type { Context as WebContext } from '@mwcp/share'

import type { CacheEvictArgs } from '../types'


export interface DecoratorExecutorOptions extends CacheEvictArgs {
  cacheManager: CacheManager
  method: (...args: unknown[]) => unknown
  methodArgs: unknown[]
  methodResult?: any
  webContext: WebContext
}

