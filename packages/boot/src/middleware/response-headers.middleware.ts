import { Middleware } from '@midwayjs/core'
import { AttrNames } from '@mwcp/otel'

import {
  Context,
  IMiddleware,
  NextFunction,
  NpmPkg,
} from '../lib/index'


/**
 * 设置默认响应 ContentType
 */
@Middleware()
export class ResponseHeadersMiddleware implements IMiddleware<Context, NextFunction> {

  static getName(): string {
    const name = 'responseHeadersMiddleware'
    return name
  }

  match(ctx?: Context) {
    const flag = !! ctx
    return flag
  }

  resolve() {
    return middleware
  }

}


async function middleware(
  ctx: Context,
  next: NextFunction,
): Promise<void> {

  await next()

  const { headers } = ctx.response
  const pkg = ctx.app.getConfig('pkg') as NpmPkg

  if (! headers[AttrNames.ServiceName]) {
    ctx.set(AttrNames.ServiceName, pkg.name)
  }

  if (! headers[AttrNames.ServiceVersion] && pkg.version) {
    ctx.set(AttrNames.ServiceVersion, pkg.version)
  }
}

