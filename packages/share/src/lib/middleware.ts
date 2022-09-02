import { Context } from '@midwayjs/koa'
import { isPathMatchRules } from '@waiting/shared-core'
import { MiddlewareConfig } from '@waiting/shared-types'


/**
 * Should middleware be enabled for request path.
 * - if mwConfig.ignore is defined, TRUE if path not matches ignore rules
 * - if mwConfig.match is defined, TRUE if path matches match rules
 */
export function shouldEnableMiddleware(
  ctx?: Context,
  mwConfig?: MiddlewareConfig,
): boolean {

  if (! ctx) {
    return false
  }
  if (! mwConfig) {
    return false
  }

  const { enableMiddleware, match, ignore } = mwConfig

  if (! enableMiddleware) {
    return false
  }

  if (Array.isArray(ignore) && ignore.length) {
    const matched = isPathMatchRules(ctx.path, ignore)
    if (matched === true) {
      return false
    }
    // if not mathched, continue to check match rules
  }

  if (Array.isArray(match) && match.length) {
    const matched = isPathMatchRules(ctx.path, match)
    return matched
  }
  else {
    return true
  }
}

