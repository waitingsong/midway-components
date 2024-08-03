import {
  type AsyncContextManager,
  type IMidwayContainer,
  ASYNC_CONTEXT_KEY,
  ASYNC_CONTEXT_MANAGER_KEY,
} from '@midwayjs/core'

import type { Context } from '../lib/types.js'


/**
 * @note need set config
 * ```ts
 * export const asyncContextManager = {
 *  enable: true,
 * }
 * ```
 */
export function getWebContext(applicationContext: IMidwayContainer): Context | undefined {
  try {
    const contextManager: AsyncContextManager = applicationContext.get(ASYNC_CONTEXT_MANAGER_KEY)
    const ctx = contextManager.active().getValue(ASYNC_CONTEXT_KEY) as Context | undefined
    return ctx
  }
  catch (ex) {
    console.warn('getWebContext() error:', ex)
    return void 0
  }
}

