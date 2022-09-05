/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { Middleware } from '@midwayjs/decorator'
import { Context, IMiddleware, NextFunction } from '@mwcp/share'

import { TracerManager, handleTopExceptionAndNext } from '../lib/tracer'
import { ConfigKey } from '../lib/types'
import { matchFunc } from '../util/common'


@Middleware()
export class TracerMiddleware implements IMiddleware<Context, NextFunction> {
  static getName(): string {
    const name = ConfigKey.middlewareName
    return name
  }

  match(ctx?: Context) {
    if (ctx) {
      if (! ctx['tracerTags']) {
        ctx['tracerTags'] = {}
      }
    }

    const flag = matchFunc(ctx)
    return flag
  }

  resolve() {
    return middleware
  }

}

/**
 * 链路追踪中间件
 * - 对不在白名单内的路由进行追踪
 * - 对异常链路进行上报
 */
export async function middleware(
  ctx: Context,
  next: NextFunction,
): Promise<void> {

  const tracerManager = await ctx.requestContext.getAsync(TracerManager)
  tracerManager.start()

  ctx.res.once('finish', () => {
    tracerManager.finish()
      .catch((ex) => {
        ctx.logger.error(ex)
      })
      .finally(() => {
        ctx['tracerTags'] = {}
      })
  })

  return handleTopExceptionAndNext(tracerManager, next)
}


