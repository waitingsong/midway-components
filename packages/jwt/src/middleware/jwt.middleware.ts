import { Middleware } from '@midwayjs/core'
import {
  Context,
  IMiddleware,
  NextFunction,
  requestPathMatched,
} from '@mwcp/share'

import { JwtComponent } from '##/lib/component.js'
import { retrieveToken } from '##/lib/resolvers.js'
import {
  ConfigKey,
  JwtAuthenticateOptions,
  JwtState,
  MiddlewareConfig,
  Msg,
  RedirectURL,
  VerifySecret,
} from '##/lib/types.js'


@Middleware()
export class JwtMiddleware implements IMiddleware<Context, NextFunction> {

  static getName(): string {
    const name = ConfigKey.middlewareName
    return name
  }

  match(ctx?: Context) {
    if (ctx) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (! ctx.state) {
        ctx.state = {}
      }
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (! ctx['jwtState']) {
        ctx['jwtState'] = {} as JwtState
      }

      const mwConfig = ctx.app.getConfig(ConfigKey.middlewareConfig) as MiddlewareConfig
      const path = ctx._routerInfo?.fullUrl ?? ctx.path
      const flag = requestPathMatched(path, mwConfig)
      return flag
    }

    return false
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

  const mwConfig = app.getConfig(ConfigKey.middlewareConfig) as MiddlewareConfig
  const { options } = mwConfig
  if (! options) {
    console.error('[JWT] mwConfig.options undefined')
    throw new TypeError('options undefined')
  }
  const { debug, cookie, passthrough } = options

  try {
    const token = retrieveToken(ctx, cookie)

    if (! token) {
      throw new Error(Msg.TokenNotFound)
    }

    const container = app.getApplicationContext()
    const svc = await container.getAsync(JwtComponent)

    const secretSet: Set<VerifySecret> = svc.genVerifySecretSet(ctx['jwtState'].secret ?? ctx.state['secret'])
    const decoded = svc.validateToken(token, secretSet)

    ctx['jwtState'].header = decoded.header
    ctx['jwtState'].signature = decoded.signature
    ctx['jwtState'].user = decoded.payload


    ctx.state['user'] = decoded.payload
    if (typeof ctx.status === 'undefined') {
      ctx.status = 200
    }
  }
  catch (ex) {
    const pass = await parseByPassthrough(ctx, passthrough)
    if (pass === true) {
      // lets downstream middlewares handle JWT exceptions
      // lets downstream middlewares handle JWT exceptions
      ctx['jwtState'].jwtOriginalError = ex as Error


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
        ctx.throw(401, msg, { originalError: ex })
      }
      else {
        throw new TypeError(msg)
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

