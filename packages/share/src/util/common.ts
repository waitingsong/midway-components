import { isPathMatchRules } from '@waiting/shared-core'
import { MiddlewareConfig } from '@waiting/shared-types'


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

