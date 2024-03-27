/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { Context } from '@mwcp/share'

import { schemePrefix } from './config.js'
import { JwtToken, JwtAuthenticateOptions } from './types.js'


/**
 *
 * Note: trim trailing white space from cookies/header,
 * according to node.js security since v10.19, v12.15
 * @link https://nodejs.org/en/blog/vulnerability/february-2020-security-releases/
 */
export function retrieveToken(ctx: Context, cookieKey: JwtAuthenticateOptions['cookie']): JwtToken {
  let token = resolveFromCookies(ctx.cookies, cookieKey)

  if (token) {
    token = token.trimEnd()
  }
  else if (ctx?.header?.cookie) {
    token = pickTokenFromHeaderCookies(ctx.header.cookie, cookieKey ?? false)
  }

  if (token) {
    token = token.trimEnd()
  }
  else {
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    let authorization: string = ctx.header && ctx.header.authorization
      ? ctx.header.authorization
      : ''
    if (authorization) {
      authorization = authorization.trimEnd()
      token = resolveFromAuthorizationHeader(authorization)
    }
    else {
      token = ''
    }
  }

  return token ? token : ''
}


/**
 * Attempts to parse the token from the Authorization header,
 * This function checks the Authorization header for a `Bearer <token>` pattern and return the token section
 *
 * @param authorization from ctx.header.authorization
 */
export function resolveFromAuthorizationHeader(authorization: string): JwtToken {
  if (typeof authorization !== 'string' || ! authorization) {
    return ''
  }

  const parts = authorization.split(/ +/u)

  if (parts.length === 2) {
    const [scheme, credentials] = parts

    if (scheme && scheme === schemePrefix) {
      return credentials ? credentials : ''
    }
  }

  return ''
}


/**
 * Attempts to retrieve the token from a cookie,
 * This function uses the opts.cookie option to retrieve the token
 */
export function resolveFromCookies(
  cookies: Context['cookies'],
  cookieKey?: JwtAuthenticateOptions['cookie'],
): JwtToken | undefined {

  if (! cookieKey) {
    return ''
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const token = cookies && typeof cookies.get === 'function'
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ? cookies.get(cookieKey)
    : ''
  return token
}

export function pickTokenFromHeaderCookies(
  cookie: string | string[],
  key: string | false,
): string {

  if (! key) {
    return ''
  }

  if (typeof cookie === 'string') {
    return pickTokenFromCookie(cookie, key)
  }
  else {
    for (const line of cookie) {
      const token = pickTokenFromCookie(line, key)
      if (token) {
        return token
      }
    }
  }

  return ''
}

function pickTokenFromCookie(
  cookie: string,
  key: string,
): string {

  const re = new RegExp(`(?<=\\b${key}=)[\\w\\d.]+`, 'u')
  const match = re.exec(cookie)
  return match && Array.isArray(match) && match[0] ? match[0] : ''
}
