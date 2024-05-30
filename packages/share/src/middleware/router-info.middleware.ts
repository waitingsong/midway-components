/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Middleware } from '@midwayjs/core'

import {
  Context,
  IMiddleware,
  NextFunction,
  getRouterInfo,
} from '##/lib/index.js'



/**
 * 读取路由信息，附加到 context._routerInfo
 */
@Middleware()
export class RouterInfoMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return middleware
  }
}


async function middleware(
  ctx: Context,
  next: NextFunction,
): Promise<void> {

  const info = await getRouterInfo(ctx)
  Object.defineProperty(ctx, '_routerInfo', { value: info ?? {} })
  await next()
}

