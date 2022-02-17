// @ts-nocheck
/* eslint-disable */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { IMiddleware } from '@midwayjs/core'
import { Middleware } from '@midwayjs/decorator'


import {
  genJwtMiddlewareConfig,
  JwtComponent,
  JwtMsg,
} from '../lib/index'
import { retrieveToken } from '../lib/resolvers'
import {
  Context,
  NextFunction,
  JwtAuthenticateOptions,
  VerifySecret,
  RedirectURL,
  JwtState,
  JwtMiddlewareConfig,
} from '../lib/types'
import { reqestPathMatched } from '../util/common'


@Middleware()
export class JwtMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return jwtMiddleware
  }
}

export async function jwtMiddleware(
  ctx: Context,
  next: NextFunction,
): Promise<void> {

  if (! ctx.jwtState) {
    ctx.jwtState = {} as JwtState
  }

  if (! ctx.state) {
    ctx.state = {}
  }

  // const pmwConfig = ctx.app.getConfig('jwtMiddlewareConfig') as JwtMiddlewareConfig
  // @ts-expect-error
  const pmwConfig = ctx.app.jwtMiddlewareConfig as JwtMiddlewareConfig
  const mwConfig = genJwtMiddlewareConfig(pmwConfig)

  const { ignore } = mwConfig
  if (reqestPathMatched(ctx, ignore)) {
    return next()
  }

  const { debug, passthrough } = mwConfig

  try {
    const token = retrieveToken(ctx, mwConfig.cookie)

    if (! token) {
      ctx.throw(401, JwtMsg.TokenNotFound)
    }

    const container = ctx.app.getApplicationContext()
    const svc = await container.getAsync(JwtComponent)

    const secretSet: Set<VerifySecret> = svc.genVerifySecretSet(
      // ctx.jwtState.secret ?? ctx.state?.secret,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ctx.jwtState.secret ? ctx.jwtState.secret : ctx.state && ctx.state.secret ? ctx.state.secret : void 0,
    )
    const decoded = svc.validateToken(token, secretSet)

    ctx.jwtState.header = decoded.header
    ctx.jwtState.signature = decoded.signature
    ctx.jwtState.user = decoded.payload
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ctx.state.user = decoded.payload
  }
  catch (ex) {
    const pass = await parseByPassthrough(ctx, passthrough)
    if (pass === true) {
      // lets downstream middlewares handle JWT exceptions
      ctx.jwtState.jwtOriginalError = ex as Error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ctx.state.jwtOriginalError = ex as Error
    }
    else if (typeof pass === 'string' && pass.length > 0) {
      ctx.redirect(pass)
      return
    }
    else {
      const msg = debug === true ? (ex as Error).message : JwtMsg.AuthFailed
      ctx.status = 401
      ctx.throw(401, msg, { originalError: ex as unknown })
    }
  }

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

