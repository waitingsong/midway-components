
import { Middleware } from '@midwayjs/core'
import { Context, IMiddleware, NextFunction } from '@mwcp/share'
import { SpanKind, SpanStatus } from '@opentelemetry/api'

import { TraceService } from '##/lib/index.js'
import { Config, ConfigKey, middlewareEnableCacheKey } from '##/lib/types.js'
import {
  addSpanEventWithOutgoingResponseData,
  parseResponseStatus,
  propagateOutgoingHeader,
} from '##/lib/util.js'

import { handleTopExceptionAndNext } from './helper.middleware.js'


@Middleware()
export class TraceMiddleware implements IMiddleware<Context, NextFunction> {

  static getName(): string {
    const name = ConfigKey.middlewareName
    return name
  }

  match(ctx: Context) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (! ctx.app) { // false when ctx is a grpc instance
      // @ts-expect-error
      ctx.app = ctx.getApp()
    }
    const config = ctx.app.getConfig(ConfigKey.config) as Config
    if (! config.enable) {
      return false
    }
    // check config.enable only, ignore middleware.enable
    // const mwConfig = ctx.app.getConfig(ConfigKey.middlewareConfig) as MiddlewareConfig
    // if (! mwConfig.enableMiddleware) {
    //   return false
    // }

    // const flag = shouldEnableMiddleware(ctx, mwConfig)
    Object.defineProperty(ctx, middlewareEnableCacheKey, {
      enumerable: true,
      writable: true,
      value: true,
    })
    return true
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

  const container = ctx.app.getApplicationContext()
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const traceSvc = container.get(TraceService) ?? await container.getAsync(TraceService)
  if (! traceSvc.config.enable) { return }
  await traceSvc.startOnRequest(ctx)

  ctx.res.once('finish', () => { finishCallback(ctx, traceSvc) })
  await handleTopExceptionAndNext(ctx, traceSvc, next)

  const rootContext = traceSvc.getRootTraceContext(ctx)
  if (rootContext) {
    propagateOutgoingHeader(rootContext, ctx.res)
  }

  const rootSpan = traceSvc.getRootSpan(ctx)
  if (rootSpan) {
    addSpanEventWithOutgoingResponseData(rootSpan, ctx)
  }
}


function finishCallback(ctx: Context, traceSvc: TraceService | undefined): void {
  if (! traceSvc) { return }
  const code = parseResponseStatus(SpanKind.CLIENT, ctx.status)
  const spanStatus: SpanStatus = { code }
  traceSvc.finish(ctx, spanStatus)
}

