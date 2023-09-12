import { isPathMatchRules } from '@waiting/shared-core'
import { MiddlewareConfig } from '@waiting/shared-types'

import type { Application } from '../lib/types.js'


/**
 * Return true if rules of match and ignore empty
 */
export function requestPathMatched(
  path: string,
  middlewareConfig?: MiddlewareConfig,
): boolean {

  if (! middlewareConfig) {
    return false
  }

  const { enableMiddleware, match, ignore } = middlewareConfig

  if (! enableMiddleware) {
    return false
  }

  if (Array.isArray(ignore) && ignore.length) {
    const matched = isPathMatchRules(path, ignore)
    return ! matched
  }
  else if (Array.isArray(match) && match.length) {
    const matched = isPathMatchRules(path, ignore)
    return matched
  }
  else {
    return true
  }
}

export function registerMiddleware(
  app: Application,
  middleware: { name: string },
  postion: 'first' | 'last' = 'last',
  force = false,
): void {

  const mwNames = app.getMiddleware().getNames()
  if (! force && mwNames.includes(middleware.name)) {
    return
  }

  switch (postion) {
    case 'first':
      // @ts-ignore
      app.getMiddleware().insertFirst(middleware)
      break
    case 'last':
      // @ts-ignore
      app.getMiddleware().insertLast(middleware)
      break
  }
}

