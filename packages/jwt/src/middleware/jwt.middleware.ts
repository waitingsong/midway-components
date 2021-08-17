
import { Provide } from '@midwayjs/decorator'
import { Secret } from 'jsonwebtoken'

import { JwtMsg } from '../lib/config'
import { Jwt } from '../lib/jwt'
import { retrieveToken } from '../lib/resolvers'
import {
  JwtAuthenticateOptions,
  JwtToken,
  JwtDecodedPayload,
  VerifySecret,
  RedirectURL,
  JwtState,
  JwtMiddlewareConfig,
  JwtConfig,
} from '../lib/types'


import {
  Context,
  IMidwayWebNext,
  IWebMiddleware,
  MidwayWebMiddleware,
} from '~/interface'


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

  const mdConfig = ctx.app.getConfig('jwtMiddlewareConfig') as JwtMiddlewareConfig
  const options = ctx.app.getConfig('jwtOptions') as JwtConfig


  const { debug } = options
  const { passthrough } = mdConfig

  if (! ctx.jwtState) {
    ctx.jwtState = { } as JwtState
  }
  if (! ctx.state) {
    ctx.state = { }
  }

  try {
    const token = retrieveToken(ctx, mdConfig)

    /* istanbul ignore else */
    if (! token) {
      ctx.throw(401, JwtMsg.TokenNotFound)
    }

    const secretSet: Set<VerifySecret> = genVerifySecretSet(
      options.secret,
      options.verifySecret,
      // ctx.jwtState.secret ?? ctx.state?.secret,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ctx.jwtState.secret ? ctx.jwtState.secret : ctx.state && ctx.state ? ctx.state.secret : void 0,
    )

    const container = ctx.app.getApplicationContext()
    const jwt = await container.getAsync(Jwt)

    const decoded = jwt.validateToken(token, secretSet, options)
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const msg = debug === true ? (ex as Error).message : JwtMsg.AuthFailed
      ctx.throw(401, msg, { originalError: ex as unknown })
    }
  }

  return next()
}


/**
 * Generate secrets for verify,
 * Note: use ctxSecret only if available
 */
function genVerifySecretSet(
  signSecret: Secret,
  verifySecret?: JwtConfig['verifySecret'],
  ctxSecret?: unknown,
): Set<VerifySecret> {

  /* istanbul ignore else */
  if ((typeof ctxSecret === 'string' || Buffer.isBuffer(ctxSecret)) && ctxSecret) {
    return new Set([ctxSecret])
  }

  const signSet = parseSecret(signSecret)
  const verifySet = parseSecret(verifySecret)
  const ret = new Set([...verifySet, ...signSet])

  return ret
}

function parseSecret(input?: JwtConfig['secret'] | JwtConfig['verifySecret']): Set<VerifySecret> {
  const ret: Set<VerifySecret> = new Set()

  /* istanbul ignore else */
  if (typeof input === 'string') {
    ret.add(input)
  }
  else if (Buffer.isBuffer(input)) {
    ret.add(input)
  }
  else if (Array.isArray(input)) {
    input.forEach((secret) => {
      ret.add(secret)
    })
  }

  return ret
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

