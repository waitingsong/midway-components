/* eslint-disable import/no-extraneous-dependencies */
import { Provide } from '@midwayjs/decorator'
import {
  IMidwayWebContext,
  IMidwayWebNext,
  IWebMiddleware,
  MidwayWebMiddleware,
} from '@midwayjs/web'

import { increaseRunningTaskCount, taskRunningState } from '../lib/helper'
import { TaskAgentService } from '../service/task-agent.service'


@Provide()
export class TaskAgentMiddleware implements IWebMiddleware {
  resolve(): MidwayWebMiddleware {
    return taskAgentMiddleware
  }
}

/**
 * 确保当前进程运行不超过指定数量的任务，
 * 超过数量则返回 429 HTTP 状态码
 */
export async function taskAgentMiddleware(
  ctx: IMidwayWebContext,
  next: IMidwayWebNext,
): Promise<unknown> {

  const { headers } = ctx.request
  if (headers['x-task-agent']) {

    if (taskRunningState.count >= 1) {
      ctx.status = 429
      const { reqId } = ctx
      ctx.body = {
        code: 429,
        reqId: reqId && typeof reqId === 'string' ? reqId : '',
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        msg: `Task running limit: ${taskRunningState.count}`,
      }
      return
    }
    increaseRunningTaskCount()
  }

  const taskAgent = await ctx.requestContext.getAsync(TaskAgentService)
  await taskAgent.run()

  return next()
}

