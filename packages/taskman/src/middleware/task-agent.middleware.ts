/* eslint-disable import/no-extraneous-dependencies */
import { Provide } from '@midwayjs/decorator'
import {
  IMidwayWebContext,
  IMidwayWebNext,
  IWebMiddleware,
  MidwayWebMiddleware,
} from '@midwayjs/web'
import { SpanLogInput, TracerTag } from '@mw-components/jaeger'
import { genISO8601String } from '@waiting/shared-core'

import { taskRunnerState } from '../lib/config'
import { decreaseRunningTaskCount, increaseRunningTaskCount } from '../lib/helper'
import { agentConcurrentConfig } from '../lib/index'
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

  const tm = ctx.tracerManager
  let isTaskRunning = false

  const { headers } = ctx.request
  if (headers['x-task-agent']) { // task distribution
    const inputLog: SpanLogInput = {
      [TracerTag.logLevel]: 'debug',
      'x-task-agent': headers['x-task-agent'],
      agentConcurrentConfig,
      taskRunnerState,
      time: genISO8601String(),
    }
    tm && tm.spanLog(inputLog)

    if (taskRunnerState.count >= taskRunnerState.max) {
      ctx.status = 429
      const { reqId } = ctx
      ctx.body = {
        code: 429,
        reqId: reqId && typeof reqId === 'string' ? reqId : '',
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        msg: `Task running limit: ${taskRunnerState.max}, now: ${taskRunnerState.count}`,
      }
      return
    }
    isTaskRunning = true
    increaseRunningTaskCount() // decreaseRunningTaskCount() 在 TaskManComponent 中任务完成后调用
  }

  if (agentConcurrentConfig.count < agentConcurrentConfig.max) {
    const taskAgent = await ctx.requestContext.getAsync(TaskAgentService)
    await taskAgent.run()
  }


  try {
    await next()
  }
  catch (ex) {
    if (isTaskRunning) {
      decreaseRunningTaskCount()
    }
    throw ex
  }
}

