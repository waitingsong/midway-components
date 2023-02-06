import { Middleware } from '@midwayjs/core'
import type { Context, IMiddleware, NextFunction } from '@mwcp/share'

import { JwtComponent } from '../lib/component'
import { retrieveToken } from '../lib/resolvers'
import {
  ConfigKey,
  JwtAuthenticateOptions,
  JwtState,
  Msg,
  VerifySecret,
  RedirectURL,
} from '../lib/types'
import {
  getMiddlewareConfig,
  matchFunc,
} from '../util/common'


@Middleware()
export class JwtMiddleware implements IMiddleware<Context, NextFunction> {
  static getName(): string {
    const name = ConfigKey.middlewareName
    return name
  }

  match(ctx?: Context) {
    if (ctx) {

      if (! ctx.state) {
        ctx.state = {}
      }
      if (! ctx['jwtState']) {
        ctx['jwtState'] = {} as JwtState
      }

    }

    const flag = matchFunc(ctx)
    return flag
  }

  resolve() {
    return middleware
  }
}

export async function middleware(
  ctx: Context,
  next: NextFunction,
): Promise<void> {

  const { app } = ctx

  const mwConfig = getMiddlewareConfig(app)
  const { options } = mwConfig
  if (! options) {
    console.error('[JWT] mwConfig.options undefined')
    throw new TypeError('options undefined')
  }
  const { debug, cookie, passthrough } = options

  try {
    const token = retrieveToken(ctx, cookie)

    if (! token) {
      console.error(Msg.TokenNotFound)
      throw new Error(Msg.TokenNotFound)
    }

    const container = app.getApplicationContext()
    const svc = await container.getAsync(JwtComponent)

    const secretSet: Set<VerifySecret> = svc.genVerifySecretSet(
      ctx['jwtState'].secret ?? ctx.state['secret'],
    )
    const decoded = svc.validateToken(token, secretSet)

    ctx['jwtState'].header = decoded.header
    ctx['jwtState'].signature = decoded.signature
    ctx['jwtState'].user = decoded.payload
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ctx.state['user'] = decoded.payload
    if (typeof ctx.status === 'undefined') {
      ctx.status = 200
    }
  }
  catch (ex) {
    const pass = await parseByPassthrough(ctx, passthrough)
    if (pass === true) {
      // lets downstream middlewares handle JWT exceptions
      ctx['jwtState'].jwtOriginalError = ex as Error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ctx.state['jwtOriginalError'] = ex as Error
      if (typeof ctx.status === 'undefined') {
        ctx.status = 200
      }
    }
    else if (typeof pass === 'string' && pass.length > 0) {
      ctx.redirect(pass)
      return
    }
    else {
      const msg = debug === true ? (ex as Error).message : Msg.AuthFailed
      ctx.status = 401
      if (typeof ctx.throw === 'function') {
        ctx.throw(401, msg, { originalError: ex as unknown })
        return
      }
      else {
        throw new Error(msg)
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return next()
}



/** Compute passthrough state */
async function parseByPassthrough(
  ctx: Context,
  input: JwtAuthenticateOptions['passthrough'],
): Promise<boolean | RedirectURL> {

  switch (typeof input) {
    case 'boolean':
      return input

    case 'string':
      return input

    case 'function':
      return input(ctx)

    default:
      return false
  }
}

