/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { Middleware } from '@midwayjs/core'
import { Attributes, TraceService } from '@mwcp/otel'
import {
  Context,
  IMiddleware,
  NextFunction,
  requestPathMatched,
} from '@mwcp/share'
import { genISO8601String } from '@waiting/shared-core'

import { TaskClientConfig, TaskServerConfig, ConfigKey, MiddlewareConfig } from '##/lib/types.js'
import { ClientService } from '##/service/client.service.js'


@Middleware()
export class TaskManMiddleware implements IMiddleware<Context, NextFunction> {
  static getName(): string {
    const name = ConfigKey.middlewareName
    return name
  }

  match(ctx?: Context) {
    if (ctx) {
      if (! ctx.state) {
        ctx.state = {}
      }

      const mwConfig = ctx.app.getConfig(ConfigKey.middlewareConfig) as MiddlewareConfig
      const flag = requestPathMatched(ctx.path, mwConfig)
      return flag
    }

    return false
  }

  resolve() {
    return middleware
  }

}

/**
 * 确保当前进程运行不超过指定数量的任务，
 * 超过数量则返回 429 HTTP 状态码
 */
async function middleware(
  ctx: Context,
  next: NextFunction,
): Promise<void> {

  const serverConfig = ctx.app.getConfig(ConfigKey.serverConfig) as TaskServerConfig
  const clientConfig = ctx.app.getConfig(ConfigKey.clientConfig) as TaskClientConfig

  const clientSvc = await ctx.requestContext.getAsync(ClientService)
  const traceSvc = await ctx.requestContext.getAsync(TraceService)
  void traceSvc

  const { headers } = ctx.request
  const taskId = headers[serverConfig.headerKeyTaskId]

  /* c8 ignore else */
  if (headers[serverConfig.headerKey]) { // task distribution
    const count = clientSvc.runningTasks.size
    const event: Attributes = {
      event: 'TaskMan-entry',
      taskId,
      pid: process.pid,
      time: genISO8601String(),
      runnerCount: count,
    }
    // traceSvc.addEvent(event)

    if (count > clientConfig.maxRunner) {
      ctx.status = 429
      const { reqId } = ctx
      ctx.body = {
        code: 429,
        reqId: reqId && typeof reqId === 'string' ? reqId : '',
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        msg: `Task running limit: ${clientConfig.maxRunner}, now: ${count}, taskId: ${taskId}`,
      }
      event['message'] = JSON.stringify(ctx.body, null, 2)
      // traceSvc?.spanLog(event)

      return
    }
  }

  if (typeof taskId === 'string' && taskId) {
    clientSvc.runningTasks.add(taskId)
  }
  else if (Array.isArray(taskId) && taskId.length) {
    taskId.forEach(id => clientSvc.runningTasks.add(id))
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return next()
}


