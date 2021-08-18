import { Provide } from '@midwayjs/decorator'

import { retrieveToken } from '../lib/resolvers'
import {
  JwtAuthenticateOptions,
  VerifySecret,
  RedirectURL,
  JwtState,
  JwtMiddlewareConfig,
} from '../lib/types'

import {
  Context,
  IMidwayWebNext,
  IWebMiddleware,
  MidwayWebMiddleware,
} from '~/interface'
import {
  genJwtMiddlewareConfig,
  JwtComponent,
  JwtMsg,
} from '~/lib/index'


@Provide()
export class JwtMiddleware implements IWebMiddleware {
  resolve(): MidwayWebMiddleware {
    return jwtMiddleware
  }
}

export async function jwtMiddleware(
  ctx: Context,
  next: IMidwayWebNext,
): Promise<void> {

  const pmwConfig = ctx.app.getConfig('jwtMiddlewareConfig') as JwtMiddlewareConfig
  const mwConfig = genJwtMiddlewareConfig(pmwConfig)

  const { debug, passthrough } = mwConfig

  if (! ctx.jwtState) {
    ctx.jwtState = { } as JwtState
  }
  if (! ctx.state) {
    ctx.state = { }
  }

  try {
    const token = retrieveToken(ctx, mwConfig)

    /* istanbul ignore else */
    if (! token) {
      ctx.throw(401, JwtMsg.TokenNotFound)
    }

    const container = ctx.app.getApplicationContext()
    const svc = await container.getAsync(JwtComponent)

    const secretSet: Set<VerifySecret> = svc.genVerifySecretSet(
      // ctx.jwtState.secret ?? ctx.state?.secret,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ctx.jwtState.secret ? ctx.jwtState.secret : ctx.state && ctx.state ? ctx.state.secret : void 0,
    )
    const decoded = svc.validateToken(token, secretSet)
    ctx.jwtState.user = decoded
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ctx.state.user = decoded
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

